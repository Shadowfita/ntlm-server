import { MessageType, ntlmSignature } from "../constants";
import MessageFields from "./fields/message_fields";
import NegotiationFlags from "./fields/negotiation_flags";
import NTLMNegotiationMessage from "./ntlm_negotiation_message";

export default class NTLMChallengeMessage {
    /**
     * An 8-byte character array that MUST contain the ASCII string `('N', 'T', 'L', 'M', 'S', 'S', 'P', '\0')`.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/b34032e5-3aae-4bc6-84c3-c6d80eadf7f2 | Negotiate Message - NTLM Open Specification}
     */
    signature: string;
    messageType: MessageType;
    targetNameFields: MessageFields;
    negotiateFlags: NegotiationFlags;
    serverChallenge: Buffer;
    //reserved 8 bytes
    targetInfoFields: MessageFields;
    //version 8 bytes

    negotiationMessage: NTLMNegotiationMessage;

    constructor(negotiationMessage: NTLMNegotiationMessage) {
        this.negotiationMessage = negotiationMessage;

        this.signature = ntlmSignature;
        this.messageType = MessageType.CHALLENGE;

        this.targetNameFields = new MessageFields();

        this.negotiateFlags = negotiationMessage.negotiateFlags;

        // if domain supplied return as the targetName
        if (this.negotiateFlags.requestTarget && this.negotiateFlags.oemDomainSupplied) {
            Object.assign(this.targetNameFields, {
                len: negotiationMessage.domainName?.length ?? 0,
                maxLen: negotiationMessage.domainName?.length ?? 0,
            });

            this.negotiateFlags.targetTypeDomain = true;
        }

        this.serverChallenge = generateRandomBytes(8);

        //skip 8 bytes reserved

        //TODO: ntlmv2 implementation
        this.targetInfoFields = new MessageFields();

        //version read 8 bytes from offset 32 - debugging only
        //https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/b1a6ceb2-f8ad-462b-b5af-f18527c48175
    }

    public toString = (): string => "";

    public toBuffer = (): Buffer => {
        const signature = Buffer.alloc(8);
        signature.write(ntlmSignature, 0, ntlmSignature.length, "ascii");

        const messageType = Buffer.alloc(4);
        messageType.writeUInt32LE(this.messageType);

        let targetNameFields = this.targetInfoFields.toBuffer();

        this.negotiateFlags.oem = false;
        const negotiateFlags = this.negotiateFlags.toBuffer();

        const serverChallenge = this.serverChallenge;

        const reserved = Buffer.alloc(8);

        const targetInfoFields = this.targetInfoFields.toBuffer();

        const version = Buffer.alloc(8);

        let partialBuffer = Buffer.concat([
            signature,
            messageType,
            targetNameFields,
            negotiateFlags,
            serverChallenge,
            reserved,
            targetInfoFields,
            version,
        ]);

        this.targetNameFields.bufferOffset = partialBuffer.length;
        targetNameFields = this.targetNameFields.toBuffer();

        const payload = Buffer.alloc(this.targetNameFields.len + this.targetInfoFields.len);

        if (
            this.negotiationMessage.domainName &&
            this.negotiateFlags.oemDomainSupplied &&
            this.negotiateFlags.requestTarget
        )
            payload.write(this.negotiationMessage.domainName, 0, this.targetNameFields.len, "ucs2");

        return Buffer.concat([
            signature,
            messageType,
            targetNameFields,
            negotiateFlags,
            serverChallenge,
            reserved,
            targetInfoFields,
            version,
            payload,
        ]);
    };
}

const generateRandomBytes = (size: number) => {
    const buffer = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
  };