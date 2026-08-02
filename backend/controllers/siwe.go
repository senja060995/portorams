package controllers

import (
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

var (
	errBadAddress   = errors.New("address tidak valid")
	errBadSignature = errors.New("signature tidak valid")
)

// siweStatement is the human-readable paragraph shown to the user inside the
// MetaMask confirmation dialog. It is deliberately short and explicit.
const siweStatement = "Masuk ke RAMS CMS. Tanda tangan ini tidak mengirimkan transaksi apa pun dan tidak memakan gas."

// NormalizeAddress validates an EVM address and returns its canonical
// lowercase form. Both all-lowercase and valid EIP-55 checksummed forms are
// accepted; a malformed address is rejected. A bare 40-character hex string
// without the 0x prefix is rejected too: downstream code (ChecksummedAddress)
// assumes the prefix is present, so allowing it would silently mangle the
// address shown in the signing message.
func NormalizeAddress(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if !strings.HasPrefix(trimmed, "0x") && !strings.HasPrefix(trimmed, "0X") {
		return "", errBadAddress
	}
	if !common.IsHexAddress(trimmed) {
		return "", errBadAddress
	}
	lower := strings.ToLower(trimmed)
	if !lowerAllOrChecksum(trimmed) {
		return "", errBadAddress
	}
	return lower, nil
}

// eip55Nibble returns the EIP-55 hash nibble for hex character index i: the
// high nibble of hash[i/2] for even i, the low nibble for odd i.
func eip55Nibble(hash []byte, i int) byte {
	if i%2 == 0 {
		return hash[i/2] >> 4
	}
	return hash[i/2] & 0x0F
}

// lowerAllOrChecksum accepts an all-lowercase address, or an address whose
// casing is a valid EIP-55 checksum. Mixed-case with a wrong checksum is
// rejected so a typo cannot silently point at a different wallet.
func lowerAllOrChecksum(addr string) bool {
	if addr == strings.ToLower(addr) {
		return true
	}
	body := addr[2:]
	hash := crypto.Keccak256([]byte(strings.ToLower(body)))
	for i := 0; i < len(body); i++ {
		ch := body[i]
		switch {
		case ch >= '0' && ch <= '9':
			// EIP-55 never changes digit casing.
			continue
		case ch >= 'a' && ch <= 'f':
			continue
		case ch >= 'A' && ch <= 'F':
			if eip55Nibble(hash, i) < 8 {
				return false
			}
		default:
			return false
		}
	}
	return true
}

// ChecksummedAddress renders a lowercase address with its EIP-55 casing, for
// display in the admin UI.
func ChecksummedAddress(lower string) string {
	body := lower[2:]
	hash := crypto.Keccak256([]byte(body))
	out := "0x"
	for i := 0; i < len(body); i++ {
		c := body[i]
		if c >= 'a' && c <= 'f' && eip55Nibble(hash, i) >= 8 {
			c = c - 'a' + 'A'
		}
		out += string(c)
	}
	return out
}

// BuildSIWEMessage assembles the exact EIP-4361 message the user is asked to
// sign. Every field is produced server-side so the browser cannot tamper with
// the challenge it approves.
func BuildSIWEMessage(domain, uri string, chainID int64, address, nonce string, issuedAt, expiresAt time.Time) string {
	return fmt.Sprintf("%s wants you to sign in with your Ethereum account:\n%s\n\n%s\n\nURI: %s\nVersion: 1\nChain ID: %d\nNonce: %s\nIssued At: %s\nExpiration Time: %s",
		domain,
		ChecksummedAddress(address),
		siweStatement,
		uri,
		chainID,
		nonce,
		issuedAt.UTC().Format(time.RFC3339),
		expiresAt.UTC().Format(time.RFC3339),
	)
}

// RecoverAddress verifies an EIP-191 signed message (personal_sign) and returns
// the signer address in lowercase. It rejects malformed signatures and
// malleable high-S signatures.
func RecoverAddress(message, signature string) (string, error) {
	msgHash := crypto.Keccak256([]byte("\x19Ethereum Signed Message:\n" + fmt.Sprintf("%d", len(message)) + message))

	sig, err := hexutil.Decode(signature)
	if err != nil {
		return "", errBadSignature
	}
	if len(sig) != 65 {
		return "", errBadSignature
	}

	// Signature is [R(32) | S(32) | V(1)]. personal_sign returns V as 27 or
	// 28; the recovery path expects 0 or 1. Normalise it in a copy.
	if sig[64] < 27 {
		return "", errBadSignature
	}
	recoveryID := sig[64] - 27
	if !crypto.ValidateSignatureValues(recoveryID, new(big.Int).SetBytes(sig[:32]), new(big.Int).SetBytes(sig[32:64]), true) {
		return "", errBadSignature
	}

	normalised := make([]byte, 65)
	copy(normalised, sig)
	normalised[64] = recoveryID

	pubKey, err := crypto.Ecrecover(msgHash, normalised)
	if err != nil {
		return "", errBadSignature
	}
	pub, err := crypto.UnmarshalPubkey(pubKey)
	if err != nil {
		return "", errBadSignature
	}

	recovered := crypto.PubkeyToAddress(*pub)
	return strings.ToLower(recovered.Hex()), nil
}
