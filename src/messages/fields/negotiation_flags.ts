
// TODO could this be an enum insetad of a class? What is easier to use in a project?
export default class NegotiationFlags {
    /**
     * If set, requests Unicode character set encoding.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    unicode: boolean = false;

    /**
     * If set, requests OEM character set encoding.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    oem: boolean = false;

    /**
     * If set, a TargetName field of the NTLMChallengeMessage (section 2.2.1.2) MUST be supplied.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    requestTarget: boolean = false;

    /**
     * If set, requests session key negotiation for message signatures. If the client sends sign = true to the server in the {@link NTLMNegotiationMessage}, the server MUST return {@link NegotiationFlags.sign | sign} = true to the client in the {@link ChallengeMessage}.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    sign: boolean = false;

    /**
     * If set, requests session key negotiation for message confidentiality. If the client sends NTLMSSP_NEGOTIATE_SEAL to the server in the NEGOTIATE_MESSAGE, the server MUST return NTLMSSP_NEGOTIATE_SEAL to the client in the CHALLENGE_MESSAGE. Clients and servers that set NTLMSSP_NEGOTIATE_SEAL SHOULD always set NTLMSSP_NEGOTIATE_56 and NTLMSSP_NEGOTIATE_128, if they are supported.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    seal: boolean = false;

    /**
     * If set, requests connectionless authentication. If NTLMSSP_NEGOTIATE_DATAGRAM is set, then NTLMSSP_NEGOTIATE_KEY_EXCH MUST always be set in the AUTHENTICATE_MESSAGE to the server and the CHALLENGE_MESSAGE to the client.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    datagram: boolean = false;

    /**
     * If set, requests LAN Manager (LM) session key computation. NTLMSSP_NEGOTIATE_LM_KEY and NTLMSSP_NEGOTIATE_EXTENDED_SESSIONSECURITY are mutually exclusive. If both NTLMSSP_NEGOTIATE_LM_KEY and NTLMSSP_NEGOTIATE_EXTENDED_SESSIONSECURITY are requested, NTLMSSP_NEGOTIATE_EXTENDED_SESSIONSECURITY alone MUST be returned to the client. NTLM v2 authentication session key generation MUST be supported by both the client and the DC in order to be used, and extended session security signing and sealing requires support from the client and the server to be used.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    lmKey: boolean = false;

    /**
     * If set, requests usage of the NTLM v1 session security protocol. NTLMSSP_NEGOTIATE_NTLM MUST be set in the NEGOTIATE_MESSAGE to the server and the CHALLENGE_MESSAGE to the client.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    ntlm: boolean = false;

    /**
     * If set, the connection SHOULD be anonymous.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/a211d894-21bc-4b8b-86ba-b83d0c167b00#Appendix_A_28 | NTLM Product Behaviour}
     */
    anonConnection: boolean = false;

    /**
     * If set, the domain name is provided (section 2.2.1.1).
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    oemDomainSupplied: boolean = false;

    /**
     * This flag indicates whether the Workstation field is present. If this flag is not set, the Workstation field MUST be ignored. If this flag is set, the length of the Workstation field specifies whether the workstation name is nonempty or not.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    oemWorkstationSupplied: boolean = false;

    /**
     * If set, a session key is generated regardless of the states of NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_SEAL. A session key MUST always exist to generate the MIC (section 3.1.5.1.2) in the authenticate message. NTLMSSP_NEGOTIATE_ALWAYS_SIGN MUST be set in the NEGOTIATE_MESSAGE to the server and the CHALLENGE_MESSAGE to the client. NTLMSSP_NEGOTIATE_ALWAYS_SIGN is overridden by NTLMSSP_NEGOTIATE_SIGN and NTLMSSP_NEGOTIATE_SEAL, if they are supported.
     *
     * @see {@link https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832 | NTLM Open Specification}
     */
    alwaysSign: boolean = false;
    targetTypeDomain: boolean = false;
    targetTypeServer: boolean = false;
    extendedSessionSecurity: boolean = false;
    identify: boolean = false;
    requestNonNTSessionKey: boolean = false;
    targetInfo: boolean = false;
    negotiateVersion: boolean = false;
    negotiate128: boolean = false;
    negotiateKeyExch: boolean = false;
    negotiate56: boolean = false;

    static fromBuffer(buffer: Buffer, offset: number): NegotiationFlags {
        const negotiationFlags = new NegotiationFlags();

        let flags = buffer.readUInt32LE(offset);

        negotiationFlags.unicode = Boolean(flags & (1 << 0));
        negotiationFlags.oem = Boolean(flags & (1 << 1));
        negotiationFlags.requestTarget = Boolean(flags & (1 << 2));
        //r10unused = Boolean(flags & 1 << 3);
        negotiationFlags.sign = Boolean(flags & (1 << 4));
        negotiationFlags.seal = Boolean(flags & (1 << 5));
        negotiationFlags.datagram = Boolean(flags & (1 << 6));
        negotiationFlags.lmKey = Boolean(flags & (1 << 7));
        //r09unused = Boolean(flags & 1 << 8);
        negotiationFlags.ntlm = Boolean(flags & (1 << 9));
        //r08unused = Boolean(flags & 1 << 10);
        negotiationFlags.anonConnection = Boolean(flags & (1 << 11));
        negotiationFlags.oemDomainSupplied = Boolean(flags & (1 << 12));
        negotiationFlags.oemWorkstationSupplied = Boolean(flags & (1 << 13));
        //r07unused = Boolean(flags & 1 << 14);
        negotiationFlags.alwaysSign = Boolean(flags & (1 << 15));
        negotiationFlags.targetTypeDomain = Boolean(flags & (1 << 16));
        negotiationFlags.targetTypeServer = Boolean(flags & (1 << 17));
        //r06unused = Boolean(flags & 1 << 18);
        negotiationFlags.extendedSessionSecurity = Boolean(flags & (1 << 19));
        negotiationFlags.identify = Boolean(flags & (1 << 20));
        //r05unused = Boolean(flags & 1 << 21);
        negotiationFlags.requestNonNTSessionKey = Boolean(flags & (1 << 22));
        negotiationFlags.targetInfo = Boolean(flags & (1 << 23));
        //r04unused = Boolean(flags & 1 << 24);
        negotiationFlags.negotiateVersion = Boolean(flags & (1 << 25));
        //r03unused = Boolean(flags & 1 << 26);
        //r02unused = Boolean(flags & 1 << 27);
        //r01unused = Boolean(flags & 1 << 28);
        negotiationFlags.negotiate128 = Boolean(flags & (1 << 29));
        negotiationFlags.negotiateKeyExch = Boolean(flags & (1 << 30));
        negotiationFlags.negotiate56 = Boolean(flags & (1 << 31));

        return negotiationFlags;
    }

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(4);

        buffer.writeUInt32LE(this.toInteger());

        return buffer;
    }

    toInteger(): number {
        let flags = 0;

        flags |= +this.unicode << 0;
        flags |= +this.oem << 1;
        flags |= +this.requestTarget << 2;
        flags |= 0 << 3;
        flags |= +this.sign << 4;
        flags |= +this.seal << 5;
        flags |= +this.datagram << 6;
        flags |= +this.lmKey << 7;
        flags |= 0 << 8;
        flags |= +this.ntlm << 9;
        flags |= 0 << 10;
        flags |= +this.anonConnection << 11;
        flags |= +this.oemDomainSupplied << 12;
        flags |= +this.oemWorkstationSupplied << 13;
        flags |= 0 << 14;
        flags |= +this.alwaysSign << 15;
        flags |= +this.targetTypeDomain << 16;
        flags |= +this.targetTypeServer << 17;
        flags |= 0 << 18;
        flags |= +this.extendedSessionSecurity << 19;
        flags |= +this.identify << 20;
        flags |= 0 << 21;
        flags |= +this.requestNonNTSessionKey << 22;
        flags |= +this.targetInfo << 23;
        flags |= 0 << 24;
        flags |= +this.negotiateVersion << 25;
        flags |= 0 << 26;
        flags |= 0 << 27;
        flags |= 0 << 28;
        flags |= +this.negotiate128 << 29;
        flags |= +this.negotiateKeyExch << 30;
        flags |= +this.negotiate56 << 31;

        return flags >>> 0; //return as unsigned 32bit int
    }
}