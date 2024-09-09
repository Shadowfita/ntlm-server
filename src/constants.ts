export const ntlmSignature = "NTLMSSP\0";

export enum MessageType {
    NEGOTIATE = 0x00000001,
    CHALLENGE = 0x00000002,
    AUTHENTICATE = 0x00000003,
}
