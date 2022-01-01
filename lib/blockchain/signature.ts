
export function getTypedSignatureMessage ({ chainId, email }: { chainId: number, email: string }) {
  return  {
    domain: {
      chainId,
      name: 'CharmVerse',
      version: '1',
    },
    message: {
      contents: 'Confirm your Notion Account',
      email,
    },
    primaryType: 'NotionAccount',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' }
      ],
      NotionAccount: [
        { name: 'email', type: 'string' },
        { name: 'contents', type: 'string' },
      ]
    },
  };
}