import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const { AZURE_STORAGE_CONNECTION_STRING, EMBED_URL } = process.env;

let containerClient: ContainerClient = null;

if(AZURE_STORAGE_CONNECTION_STRING) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );
    
    const containerName = "media"
    containerClient = blobServiceClient.getContainerClient(containerName);
    containerClient.createIfNotExists({ access: "container" });
}

const canUploadToAzure = (): boolean => {
    return !!containerClient;
}

const uploadFile = async (filePath: string) => {
    if(!containerClient) {
        throw new Error("Azure Storage Not Configured.");
    }
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.uploadFile(filePath);
    return `${EMBED_URL}${fileName.substring(0, fileName.indexOf("."))}`
}

export {
    uploadFile,
    canUploadToAzure
}