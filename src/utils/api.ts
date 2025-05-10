// API endpoints for file operations
import { withCorsProxy } from './corsProxy';
import { API_BASE_URL, SECRET_PASSWORD } from './config';
import { encryptData, decryptData } from './encryption';
import { processEncryptedZip } from './zipUtils';

// Available operations and their corresponding endpoints
export const OPERATIONS = {
  COMPRESS: 'compress',
  MERGE: 'merge',
  SPLIT: 'split',
  IMG_COMPRESSOR: 'imgCompressor'
};

/**
 * Process a file based on the operation requested
 * @param files Files to process
 * @param operation Operation to perform (compress, merge, split, etc.)
 * @param constraints Additional constraints for the operation
 * @returns Processed file or blob
 */
export const processFile = async (
  files: File[],
  operation: string,
  constraints: any = {}
): Promise<Blob> => {
  if (!files || files.length === 0) {
    throw new Error('No files provided for processing');
  }
  
  const formData = new FormData();
  
  try {
    // For merge operation, we need to handle multiple files
    if (operation === OPERATIONS.MERGE) {
      if (files.length < 2) {
        throw new Error('At least two files are required for merging');
      }
      
      // Encrypt each file before sending
      for (const file of files) {
        const fileData = await file.arrayBuffer();
        const encryptedData = await encryptData(fileData, SECRET_PASSWORD);
        const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
        formData.append('files', encryptedBlob, file.name);
      }
    } else {
      // For other operations, we only need the first file
      const file = files[0];
      
      // Store original file type for later use
      const originalFileType = file.type;
      
      // Validate file type for specific operations
      const fileType = file.type;
      if (operation === OPERATIONS.COMPRESS && !fileType.includes('pdf')) {
        throw new Error('PDF compression requires a PDF file');
      } else if (operation === OPERATIONS.IMG_COMPRESSOR && !fileType.includes('image')) {
        throw new Error('Image compression requires an image file');
      } else if (operation === OPERATIONS.SPLIT && !fileType.includes('pdf')) {
        throw new Error('PDF splitting requires a PDF file');
      }
      
      // Encrypt file before sending
      const fileData = await file.arrayBuffer();
      console.log(`Encrypting file for ${operation}...`, {
        fileName: file.name,
        fileType: file.type,
        fileSize: fileData.byteLength
      });
      
      const encryptedData = await encryptData(fileData, SECRET_PASSWORD);
      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
      formData.append('file', encryptedBlob, file.name);
      
      // Store original file info in formData
      formData.append('originalFileName', file.name);
      formData.append('originalFileType', originalFileType);
    }
    
    // Add constraints as JSON string
    formData.append('constraints', JSON.stringify(constraints));
    
    // Special handling for specific operations
    if (operation === OPERATIONS.IMG_COMPRESSOR) {
      console.log('Image compression operation detected - using specific handling');
      
      // For image compression, always return the response directly
      // This is because the server might be handling encryption/decryption differently
      const apiUrl = withCorsProxy(`${API_BASE_URL}/${operation}`);
      
      console.log(`Sending request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Password': SECRET_PASSWORD
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server error (${response.status}):`, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
      }
      
      const responseBlob = await response.blob();
      console.log('Image compression response received:', {
        size: responseBlob.size,
        type: responseBlob.type
      });
      
      // Try to determine the correct content type
      let contentType = files[0].type; // Default to original image type
      
      // Check if we can detect the image type
      const arrayBuffer = await responseBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check for JPEG header
      if (bytes.length > 2 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
        contentType = 'image/jpeg';
      }
      // Check for PNG header
      else if (bytes.length > 8 && 
              bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        contentType = 'image/png';
      }
      
      return new Blob([arrayBuffer], { type: contentType });
    }
    
    // For other operations, use the existing code
    const apiUrl = withCorsProxy(`${API_BASE_URL}/${operation}`);
    
    console.log(`Sending request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Password': SECRET_PASSWORD
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error (${response.status}):`, errorText);
      throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
    }
    
    // Get response as blob
    const encryptedResponseBlob = await response.blob();
    
    // Special handling for ZIP files (split operation) - need special processing
    if (operation === OPERATIONS.SPLIT) {
      console.log('Split operation detected - processing ZIP file');
      try {
        // Process the ZIP file to decrypt the .enc files inside
        const processedZip = await processEncryptedZip(encryptedResponseBlob);
        return processedZip;
      } catch (error) {
        console.error('Error processing ZIP file:', error);
        // Fall back to returning the original ZIP if processing fails
        return encryptedResponseBlob;
      }
    }
    
    // Decrypt the response for other operations
    console.log(`Decrypting response from ${operation} API...`);
    try {
      // Check if the response is likely encrypted (length is multiple of 16 + IV)
      if ((encryptedResponseBlob.size - 16) % 16 === 0) {
        // Response appears to be encrypted, try to decrypt it
        const decryptedData = await decryptData(encryptedResponseBlob, SECRET_PASSWORD);
        
        // Get original content type from headers or infer from operation
        let contentType;
        if (operation === OPERATIONS.COMPRESS) {
          contentType = 'application/pdf';
        } else if (operation === OPERATIONS.MERGE) {
          contentType = 'application/pdf';
        } else {
          contentType = response.headers.get('X-Original-Content-Type') || 'application/octet-stream';
        }
        
        return new Blob([decryptedData], { type: contentType });
      } else {
        // Response doesn't appear to be encrypted, return it as-is
        console.log('Response does not appear to be encrypted (length not multiple of 16), returning as-is');
        
        // Determine content type based on operation
        let contentType;
        if (operation === OPERATIONS.COMPRESS) {
          contentType = 'application/pdf';
        } else if (operation === OPERATIONS.MERGE) {
          contentType = 'application/pdf';
        } else {
          contentType = response.headers.get('X-Original-Content-Type') || 'application/octet-stream';
        }
        
        return new Blob([await encryptedResponseBlob.arrayBuffer()], { type: contentType });
      }
    } catch (error) {
      console.error('Decryption failed, returning response as-is:', error);
      // Return the encrypted blob directly
      return encryptedResponseBlob;
    }
  } catch (error) {
    console.error(`Error processing file with operation ${operation}:`, error);
    throw error;
  }
};

/**
 * Analyzes the user's prompt to determine the operation to perform
 * @param prompt User's prompt text
 * @param files Files that were uploaded (to analyze file types)
 * @returns Operation to perform
 */
export const analyzePrompt = (prompt: string, files?: File[]): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Check for specific operations in the prompt
  if (lowerPrompt.includes('compress') || lowerPrompt.includes('optimize')) {
    // If it's a PDF compression request
    if (lowerPrompt.includes('pdf')) {
      return OPERATIONS.COMPRESS;
    }
    
    // If it's an image compression request
    if (lowerPrompt.includes('image') || lowerPrompt.includes('img') || 
        lowerPrompt.includes('picture') || lowerPrompt.includes('photo')) {
      return OPERATIONS.IMG_COMPRESSOR;
    }
    
    // If we have files, check their types
    if (files && files.length > 0) {
      const fileType = files[0].type;
      
      if (fileType.includes('pdf')) {
        return OPERATIONS.COMPRESS;
      } else if (fileType.includes('image')) {
        return OPERATIONS.IMG_COMPRESSOR;
      }
    }
    
    // Default compression
    return OPERATIONS.COMPRESS;
  }
  
  // Check for merge operations
  if (lowerPrompt.includes('merge') || lowerPrompt.includes('combine') || 
      lowerPrompt.includes('join') || lowerPrompt.includes('concat')) {
    return OPERATIONS.MERGE;
  }
  
  // Check for split operations
  if (lowerPrompt.includes('split') || lowerPrompt.includes('separate') || 
      lowerPrompt.includes('divide')) {
    return OPERATIONS.SPLIT;
  }
  
  // If no operation is specified, try to determine from file type
  if (files && files.length > 0) {
    const fileType = files[0].type;
    
    if (fileType.includes('pdf')) {
      return OPERATIONS.COMPRESS;
    } else if (fileType.includes('image')) {
      return OPERATIONS.IMG_COMPRESSOR;
    }
  }
  
  // Default to compression if we can't determine
  return OPERATIONS.COMPRESS;
};

/**
 * Helper function to download a file
 * @param blob File blob
 * @param filename Suggested filename
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get appropriate filename for the processed file
 * @param originalName Original filename
 * @param operation Operation performed
 * @returns Suggested filename
 */
export const getProcessedFilename = (originalName: string, operation: string): string => {
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
  
  switch (operation) {
    case OPERATIONS.COMPRESS:
      return `${baseName}_compressed.${extension}`;
    case OPERATIONS.MERGE:
      return `merged.pdf`;
    case OPERATIONS.SPLIT:
      return `split_result.zip`;
    case OPERATIONS.IMG_COMPRESSOR:
      return `${baseName}_compressed.${extension}`;
    default:
      return `processed_${originalName}`;
  }
}; 