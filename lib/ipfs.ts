/**
 * IPFS upload utility — uploads files to Pinata and returns the CID.
 * 
 * What is a CID?
 * A CID (Content Identifier) is a unique fingerprint for a file on IPFS 
 * (InterPlanetary File System). Unlike a normal URL that points to a server 
 * location (like amazon.com/image.png), a CID points to the file's content itself. 
 * If the file changes, its CID changes. We store the CID on the blockchain so 
 * everyone can verify exactly which image was uploaded without us paying the high 
 * cost of storing the actual image data on-chain.
 */

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export async function pinFileToIPFS(file: File | Buffer, filename: string): Promise<string> {
  const pinataJwt = process.env.PINATA_JWT;

  if (!pinataJwt) {
    throw new Error('PINATA_JWT is not configured in environment variables');
  }

  const formData = new FormData();
  // If file is a Buffer, we can wrap it in a Blob/File, but in Next.js App Router
  // request.formData() gives us a File object.
  formData.append('file', file as Blob, filename);

  const metadata = JSON.stringify({ name: filename });
  formData.append('pinataMetadata', metadata);

  const response = await fetch(PINATA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pinata upload failed:', errorText);
    throw new Error('Failed to upload file to IPFS');
  }

  const data = await response.json();
  return data.IpfsHash as string;
}

export function ipfsUrl(cid: string): string {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'https://gateway.pinata.cloud';
  return `${gateway}/ipfs/${cid}`;
}
