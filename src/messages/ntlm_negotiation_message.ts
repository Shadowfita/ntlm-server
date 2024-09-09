import { MessageType, ntlmSignature } from "../constants";
import MessageFields from "./fields/message_fields";
import NegotiationFlags from "./fields/negotiation_flags";

export default class NTLMNegotiationMessage {
    /**
     * An 8-byte character array that MUST contain the ASCII string `('N', 'T', 'L', 'M', 'S', 'S', 'P', '\0')`.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/b34032e5-3aae-4bc6-84c3-c6d80eadf7f2 | Negotiate Message - NTLM Open Specification}
     */
    signature: string;
    messageType: MessageType;
    negotiateFlags: NegotiationFlags;
    domainNameFields: MessageFields;
    workstationFields: MessageFields;
    //version

    //Payload data:
    domainName: string | undefined;
    workstationName: string | undefined;

    constructor(header: string) {
        const buffer = Buffer.from(header.split(" ")[1], "base64");

        this.signature = buffer.toString("ascii", 0, 8);

        if (this.signature != ntlmSignature) throw new Error("Invalid NTLM signature");

        this.messageType = buffer.readUInt32LE(8);
        this.negotiateFlags = NegotiationFlags.fromBuffer(buffer, 12);
        this.domainNameFields = MessageFields.fromBuffer(buffer, 16);
        this.workstationFields = MessageFields.fromBuffer(buffer, 24);

        //version read 8 bytes from offset 32 - debugging only
        //https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/b1a6ceb2-f8ad-462b-b5af-f18527c48175

        if (this.negotiateFlags.unicode) {
            if (this.negotiateFlags.oemDomainSupplied)
                this.domainName = buffer.toString(
                    "ucs2",
                    this.domainNameFields.bufferOffset,
                    this.domainNameFields.bufferOffset + this.domainNameFields.len
                );

            if (this.negotiateFlags.oemWorkstationSupplied)
                this.workstationName = buffer.toString(
                    "ucs2",
                    this.workstationFields.bufferOffset,
                    this.workstationFields.bufferOffset + this.workstationFields.len
                );
        } else if (!this.negotiateFlags.unicode && this.negotiateFlags.oem) {
            // process OEM character set
        } else {
            // The protocol MUST return SEC_E_INVALID_TOKEN.
            // https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832
        }
    }
}
