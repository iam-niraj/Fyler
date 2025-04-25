/**
 * File encryption/decryption utilities
 * Based on the encryption functions in content.js
 */

import { SECRET_PASSWORD } from './config';

/**
 * Derives an encryption key from a password
 * @param password The password to derive the key from
 * @returns An encryption key as Uint8Array
 */
export const getKey = (password: string): Uint8Array => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(password);
  const key = new Uint8Array(32);
  key.set(encoded.subarray(0, 32));
  return key;
};

/**
 * Applies PKCS7 padding to data
 * @param data Data to pad
 * @returns Padded data
 */
export const padPKCS7 = (data: Uint8Array): Uint8Array => {
  const blockSize = 16;
  const paddingLength = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + paddingLength);
  padded.set(data);
  padded.fill(paddingLength, data.length);
  return padded;
};

/**
 * Removes PKCS7 padding from data
 * @param data Padded data
 * @returns Unpadded data
 */
export const unpadPKCS7 = (data: Uint8Array): Uint8Array => {
  const paddingLength = data[data.length - 1];
  if (paddingLength < 1 || paddingLength > 16) {
    throw new Error('Invalid padding');
  }
  
  // Validate padding bytes
  for (let i = data.length - paddingLength; i < data.length; i++) {
    if (data[i] !== paddingLength) {
      throw new Error('Invalid padding');
    }
  }
  
  return data.subarray(0, data.length - paddingLength);
};

/**
 * Encrypts file data for sending to the server
 * @param data File data to encrypt
 * @param password Password to use for encryption
 * @returns Encrypted data
 */
export const encryptData = async (data: ArrayBuffer, password: string = SECRET_PASSWORD): Promise<Uint8Array> => {
  const key = getKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV

  // Validate input data
  if (!(data instanceof ArrayBuffer)) {
    data = new Uint8Array(data).buffer;
  }

  // Apply padding
  const blockSize = 16;
  const paddingLength = blockSize - (data.byteLength % blockSize);
  const paddedData = new Uint8Array(data.byteLength + paddingLength);
  paddedData.set(new Uint8Array(data));
  paddedData.fill(paddingLength, data.byteLength);

  // Import key and encrypt
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'AES-CBC' }, false, ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv }, cryptoKey, paddedData
  );

  // Build final encrypted data (IV + ciphertext)
  const result = new Uint8Array(16 + ciphertext.byteLength);
  result.set(iv, 0); // First 16 bytes = IV
  result.set(new Uint8Array(ciphertext), 16);

  // Verify structure
  if (result.length < 16) {
    throw new Error("Invalid encrypted data: Missing IV");
  }

  console.log('Encryption completed:', {
    originalSize: data.byteLength,
    paddedSize: paddedData.length,
    encryptedSize: result.length
  });

  return result;
};

/**
 * Decrypts data received from the server
 * @param encryptedData Encrypted data
 * @param password Password to use for decryption
 * @returns Decrypted data
 */
export const decryptData = async (encryptedData: Blob | ArrayBuffer | Uint8Array, password: string = SECRET_PASSWORD): Promise<Uint8Array> => {
  // Convert input to Uint8Array
  let bytes: Uint8Array;
  if (encryptedData instanceof Uint8Array) {
    bytes = encryptedData;
  } else if (encryptedData instanceof ArrayBuffer) {
    bytes = new Uint8Array(encryptedData);
  } else {
    bytes = new Uint8Array(await encryptedData.arrayBuffer());
  }

  // Log information about the data
  console.log('Decryption attempt:', {
    dataLength: bytes.length,
    firstFewBytes: Array.from(bytes.slice(0, 16)),
    alignmentCheck: (bytes.length - 16) % 16
  });

  // Validate encrypted data structure
  if (bytes.length < 32) {
    console.warn(`Data too short for decryption (${bytes.length} < 32), returning as-is`);
    return bytes;
  }
  
  if ((bytes.length - 16) % 16 !== 0) {
    console.warn(`Data length not aligned for AES-CBC: ${bytes.length - 16} not multiple of 16`);
    console.warn('This might not be encrypted data, or using a different format');
    
    // If the data appears to be a PDF (starts with %PDF), return it as-is
    const dataStart = new TextDecoder().decode(bytes.slice(0, 10));
    if (dataStart.startsWith('%PDF')) {
      console.log('Data appears to be a PDF already, returning as-is');
      return bytes;
    }
    
    throw new Error(`Invalid ciphertext length: ${bytes.length - 16}`);
  }

  // Extract IV and ciphertext
  const iv = bytes.slice(0, 16);
  const ciphertext = bytes.slice(16);

  // Derive key from password
  const encoder = new TextEncoder();
  const keyBuf = new Uint8Array(32);
  const passBytes = encoder.encode(password);
  keyBuf.set(passBytes.slice(0, 32));  // Truncate or zero-pad to 32 bytes

  try {
    // Import key and decrypt
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyBuf, 'AES-CBC', false, ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv }, cryptoKey, ciphertext
    );
    
    const decryptedBytes = new Uint8Array(decrypted);

    // Check if this looks like a valid PDF (should start with %PDF)
    const decryptedStart = new TextDecoder().decode(decryptedBytes.slice(0, 10));
    const isPdf = decryptedStart.startsWith('%PDF');
    
    // Validate and remove padding, but only if it doesn't look like a valid PDF already
    // (Some PDFs might coincidentally have valid padding bytes)
    if (!isPdf) {
      const padValue = decryptedBytes[decryptedBytes.length - 1];
      if (padValue < 1 || padValue > 16) {
        console.error('Invalid padding value:', padValue);
        throw new Error(`Invalid padding value: ${padValue}`);
      }
      
      // Ensure all padding bytes are correct
      for (let i = decryptedBytes.length - padValue; i < decryptedBytes.length; i++) {
        if (decryptedBytes[i] !== padValue) {
          console.error('Padding bytes mismatch');
          throw new Error('Padding bytes mismatch');
        }
      }
      
      // Remove padding
      return decryptedBytes.slice(0, decryptedBytes.length - padValue);
    }
    
    console.log('Decryption successful: Found PDF signature');
    return decryptedBytes;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}; 