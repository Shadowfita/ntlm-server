import { MessageType, ntlmSignature } from "../constants";
import MessageFields from "./fields/message_fields";
import NegotiationFlags from "./fields/negotiation_flags";

export default class NTLMAuthenticateMessage {
    /**
     * An 8-byte character array that MUST contain the ASCII string `('N', 'T', 'L', 'M', 'S', 'S', 'P', '\0')`.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/b34032e5-3aae-4bc6-84c3-c6d80eadf7f2 | Negotiate Message - NTLM Open Specification}
     */
    signature: string;
    messageType: MessageType;

    lmChallengeResponseFields: MessageFields;
    ntChallengeResponseFields: MessageFields;
    domainNameFields: MessageFields;
    userNameFields: MessageFields;
    workstationFields: MessageFields;
    encryptedRandomSessionKeyFields: MessageFields;

    negotiateFlags: NegotiationFlags;
    //version 8 bytes
    //MIC 16 bytes

    //Payload data:
    lmChallenge: Buffer | undefined;
    ntChallenge: Buffer | undefined;
    domainName: string | undefined;
    userName: string | undefined;
    workstationName: string | undefined;
    encryptedRandomSessionKey: string | undefined;

    constructor(header: string) {
        const buffer = Buffer.from(header.split(" ")[1], "base64");

        this.signature = buffer.toString("ascii", 0, 8);

        if (this.signature != ntlmSignature) throw new Error("Invalid NTLM signature");

        this.messageType = buffer.readUInt32LE(8);

        this.lmChallengeResponseFields = MessageFields.fromBuffer(buffer, 12);
        this.ntChallengeResponseFields = MessageFields.fromBuffer(buffer, 20);
        this.domainNameFields = MessageFields.fromBuffer(buffer, 28);
        this.userNameFields = MessageFields.fromBuffer(buffer, 36);
        this.workstationFields = MessageFields.fromBuffer(buffer, 44);
        this.encryptedRandomSessionKeyFields = MessageFields.fromBuffer(buffer, 52);

        this.negotiateFlags = NegotiationFlags.fromBuffer(buffer, 60);

        //skip version 8 bytes

        //skip MIC 16 bytes

        if (this.lmChallengeResponseFields.len)
            this.lmChallenge = buffer.subarray(
                this.lmChallengeResponseFields.bufferOffset,
                this.lmChallengeResponseFields.bufferOffset + this.lmChallengeResponseFields.len
            );

        if (this.ntChallengeResponseFields.len)
            this.ntChallenge = buffer.subarray(
                this.ntChallengeResponseFields.bufferOffset,
                this.ntChallengeResponseFields.bufferOffset + this.ntChallengeResponseFields.len
            );

        if (this.domainNameFields.len)
            this.domainName = buffer.toString(
                this.negotiateFlags.unicode ? "ucs2" : "ascii",
                this.domainNameFields.bufferOffset,
                this.domainNameFields.bufferOffset + this.domainNameFields.len
            );

        if (this.userNameFields.len)
            this.userName = buffer.toString(
                this.negotiateFlags.unicode ? "ucs2" : "ascii",
                this.userNameFields.bufferOffset,
                this.userNameFields.bufferOffset + this.userNameFields.len
            );

        if (this.workstationFields.len)
            this.workstationName = buffer.toString(
                this.negotiateFlags.unicode ? "ucs2" : "ascii",
                this.workstationFields.bufferOffset,
                this.workstationFields.bufferOffset + this.workstationFields.len
            );

        if (this.encryptedRandomSessionKeyFields.len)
            this.encryptedRandomSessionKey = buffer.toString(
                this.negotiateFlags.unicode ? "ucs2" : "ascii",
                this.encryptedRandomSessionKeyFields.bufferOffset,
                this.encryptedRandomSessionKeyFields.bufferOffset + this.encryptedRandomSessionKeyFields.len
            );
    }
}
