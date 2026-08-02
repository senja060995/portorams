package controllers

import (
	"crypto/ecdsa"
	"encoding/hex"
	"fmt"
	"math/big"
	"strings"
	"testing"

	"github.com/ethereum/go-ethereum/crypto"
)

func signPersonal(priv *ecdsa.PrivateKey, message string) (string, error) {
	hash := crypto.Keccak256([]byte("\x19Ethereum Signed Message:\n" + fmt.Sprintf("%d", len(message)) + message))
	sig, err := crypto.Sign(hash, priv)
	if err != nil {
		return "", err
	}
	// go-ethereum Sign returns V as 0/1; MetaMask returns 27/28.
	sig[64] += 27
	return "0x" + hex.EncodeToString(sig), nil
}

func randomKey(t *testing.T) (*ecdsa.PrivateKey, string) {
	t.Helper()
	priv, err := crypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey: %v", err)
	}
	addr := crypto.PubkeyToAddress(priv.PublicKey)
	return priv, strings.ToLower(addr.Hex())
}

func TestRecoverAddressRoundTrip(t *testing.T) {
	priv, addr := randomKey(t)
	message := "localhost:3000 wants you to sign in with your Ethereum account:\n0xAbC\n\nStatement\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1\nNonce: abc123\nIssued At: 2026-01-01T00:00:00Z\nExpiration Time: 2026-01-01T00:05:00Z"

	sig, err := signPersonal(priv, message)
	if err != nil {
		t.Fatalf("signPersonal: %v", err)
	}
	recovered, err := RecoverAddress(message, sig)
	if err != nil {
		t.Fatalf("RecoverAddress: %v", err)
	}
	if recovered != addr {
		t.Fatalf("recovered %s want %s", recovered, addr)
	}
}

func TestRecoverAddressRejectsTamperedMessage(t *testing.T) {
	priv, addr := randomKey(t)
	message := "message to sign"
	sig, err := signPersonal(priv, message)
	if err != nil {
		t.Fatalf("signPersonal: %v", err)
	}
	// Recovery always yields *some* signer; the caller compares it to the
	// claimed address. A tampered message must not recover to the original.
	recovered, err := RecoverAddress(message+" extra", sig)
	if err != nil {
		t.Fatalf("RecoverAddress: %v", err)
	}
	if recovered == addr {
		t.Fatalf("tampered message recovered to the original address %s", addr)
	}
}

func TestRecoverAddressRejectsMalformedSignature(t *testing.T) {
	priv, _ := randomKey(t)
	message := "message to sign"
	sig, err := signPersonal(priv, message)
	if err != nil {
		t.Fatalf("signPersonal: %v", err)
	}
	if _, err := RecoverAddress(message, sig[:130]); err == nil {
		t.Fatal("expected error for truncated signature")
	}
}

func TestRecoverAddressRejectsHighS(t *testing.T) {
	priv, _ := randomKey(t)
	message := "message to sign"
	sig, err := signPersonal(priv, message)
	if err != nil {
		t.Fatalf("signPersonal: %v", err)
	}
	raw, _ := hex.DecodeString(sig[2:])
	secp256k1N, _ := new(big.Int).SetString("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16)
	s := new(big.Int).SetBytes(raw[32:64])
	s.Sub(secp256k1N, s)
	highS := append([]byte{}, raw[:32]...)
	highS = append(highS, s.FillBytes(make([]byte, 32))...)
	highS = append(highS, 27)
	if _, err := RecoverAddress(message, "0x"+hex.EncodeToString(highS)); err == nil {
		t.Fatal("expected error for malleable high-S signature")
	}
}

func TestNormalizeAddressAndChecksum(t *testing.T) {
	lower := "0x3a355a346ec5c0cce3c82d49b3c854c1815c259e"
	checksummed := "0x3A355a346EC5c0Cce3c82D49B3C854c1815C259E"

	got, err := NormalizeAddress(checksummed)
	if err != nil || got != lower {
		t.Fatalf("NormalizeAddress(%s) = %s, %v", checksummed, got, err)
	}
	got, err = NormalizeAddress(lower)
	if err != nil || got != lower {
		t.Fatalf("NormalizeAddress(lower) = %s, %v", got, err)
	}
	if ChecksummedAddress(lower) != checksummed {
		t.Fatalf("ChecksummedAddress mismatch: %s", ChecksummedAddress(lower))
	}

	// A bad checksum must be rejected so a typo cannot target another wallet.
	if _, err := NormalizeAddress("0x3a355A346ec5c0cce3c82d49b3c854c1815c259e"); err == nil {
		t.Fatal("expected error for wrong checksum")
	}
	if _, err := NormalizeAddress("0xZZZZ"); err == nil {
		t.Fatal("expected error for non-hex address")
	}
}

func BenchmarkKeccakViaCrypto(b *testing.B) {
	randBytes := make([]byte, 32)
	copy(randBytes, []byte("RAMS keccak benchmark input 12345"))
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = crypto.Keccak256(randBytes)
	}
}
