/**
 * Utilities for handling ZIP files, especially for split PDF operations
 */

import JSZip from 'jszip';
import { decryptData } from './encryption';
import { SECRET_PASSWORD } from './config';

/**
 * Process a ZIP file with encrypted content
 * @param zipBlob ZIP file as a Blob
 * @returns A new Blob containing the ZIP with decrypted content
 */
export const processEncryptedZip = async (zipBlob: Blob): Promise<Blob> => {
  console.log('Processing encrypted ZIP file:', { size: zipBlob.size });
  
  try {
    // Load the ZIP file
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(await zipBlob.arrayBuffer());
    
    // Create a new ZIP for the decrypted files
    const newZip = new JSZip();
    
    // Process each file in the ZIP
    const filePromises = Object.keys(loadedZip.files).map(async (filename) => {
      const zipEntry = loadedZip.files[filename];
      
      // Skip directories
      if (zipEntry.dir) {
        newZip.folder(filename);
        return;
      }
      
      // Get the file content as ArrayBuffer
      const fileData = await zipEntry.async('arraybuffer');
      
      // Determine if we need to decrypt this file
      if (filename.endsWith('.enc')) {
        try {
          // Decrypt the file
          console.log(`Decrypting file: ${filename}`);
          const decryptedData = await decryptData(fileData, SECRET_PASSWORD);
          
          // Add to new ZIP with updated filename (remove .enc extension)
          const newFilename = filename.replace(/\.enc$/, '');
          newZip.file(newFilename, decryptedData);
        } catch (error) {
          console.error(`Error decrypting file ${filename}:`, error);
          // If decryption fails, add the original file
          newZip.file(filename, fileData);
        }
      } else {
        // Not encrypted, add as-is
        newZip.file(filename, fileData);
      }
    });
    
    // Wait for all files to be processed
    await Promise.all(filePromises);
    
    // Generate the new ZIP file
    const newZipBlob = await newZip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Medium compression level
      }
    });
    
    console.log('ZIP processing complete. Original size:', zipBlob.size, 'New size:', newZipBlob.size);
    return newZipBlob;
  } catch (error) {
    console.error('Error processing ZIP file:', error);
    // Return original if processing fails
    return zipBlob;
  }
}; 