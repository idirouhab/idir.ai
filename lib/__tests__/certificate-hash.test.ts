/**
 * Unit tests for certificate hashing utilities
 *
 * To run: npm test lib/__tests__/certificate-hash.test.ts
 */

import {
  stableStringify,
  sha256Hash,
  hashEmail,
  generateCertificateHash,
  verifyCertificateHash,
  createCertificateSnapshot,
  type CertificateSnapshot,
} from '../certificate-hash';

describe('Certificate Hashing Utilities', () => {
  describe('stableStringify', () => {
    it('should produce consistent output for objects with same keys in different order', () => {
      const obj1 = { z: 3, a: 1, m: 2 };
      const obj2 = { a: 1, m: 2, z: 3 };
      const obj3 = { m: 2, z: 3, a: 1 };

      const result1 = stableStringify(obj1);
      const result2 = stableStringify(obj2);
      const result3 = stableStringify(obj3);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should handle nested objects correctly', () => {
      const obj1 = {
        outer: { z: 3, a: 1 },
        name: 'test',
      };
      const obj2 = {
        name: 'test',
        outer: { a: 1, z: 3 },
      };

      expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    it('should handle arrays consistently', () => {
      const obj1 = { items: [1, 2, 3], name: 'test' };
      const obj2 = { name: 'test', items: [1, 2, 3] };

      expect(stableStringify(obj1)).toBe(stableStringify(obj2));
    });

    it('should handle null and undefined', () => {
      expect(stableStringify(null)).toBe('null');
      expect(stableStringify(undefined)).toBe('undefined');
    });

    it('should handle primitive types', () => {
      expect(stableStringify('hello')).toBe('"hello"');
      expect(stableStringify(42)).toBe('42');
      expect(stableStringify(true)).toBe('true');
      expect(stableStringify(false)).toBe('false');
    });

    it('should produce same output for deeply nested complex structures', () => {
      const complex1 = {
        z: { nested: { deep: { value: 'test' } } },
        a: [1, { x: 2, y: 3 }],
        m: 'middle',
      };
      const complex2 = {
        m: 'middle',
        a: [1, { y: 3, x: 2 }],
        z: { nested: { deep: { value: 'test' } } },
      };

      expect(stableStringify(complex1)).toBe(stableStringify(complex2));
    });
  });

  describe('sha256Hash', () => {
    it('should produce consistent SHA-256 hashes', () => {
      const input = 'test string';
      const hash1 = sha256Hash(input);
      const hash2 = sha256Hash(input);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // Valid hex string
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = sha256Hash('input1');
      const hash2 = sha256Hash('input2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce known SHA-256 hash for test vector', () => {
      // Known SHA-256 hash for empty string
      const hash = sha256Hash('');
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should be case-sensitive', () => {
      const hash1 = sha256Hash('Test');
      const hash2 = sha256Hash('test');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('hashEmail', () => {
    it('should normalize and hash emails consistently', () => {
      const hash1 = hashEmail('user@example.com');
      const hash2 = hashEmail('USER@EXAMPLE.COM');
      const hash3 = hashEmail('  user@example.com  ');

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it('should produce different hashes for different emails', () => {
      const hash1 = hashEmail('alice@example.com');
      const hash2 = hashEmail('bob@example.com');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce valid hex strings', () => {
      const hash = hashEmail('test@example.com');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('generateCertificateHash', () => {
    const sampleSnapshot: CertificateSnapshot = {
      certificate_id: 'CERT-2026-12345678-1234-1234-1234-123456789ABC',
      student_full_name: 'John Doe',
      student_email_hash: hashEmail('john@example.com'),
      course_id: 'course-uuid-123',
      course_title: 'Automation 101',
      course_version: '2026-01-01T00:00:00.000Z',
      completed_at: '2026-01-15T10:30:00.000Z',
      issued_at: '2026-01-15T11:00:00.000Z',
    };

    it('should produce consistent hash for same snapshot', () => {
      const hash1 = generateCertificateHash(sampleSnapshot);
      const hash2 = generateCertificateHash(sampleSnapshot);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce same hash regardless of key order', () => {
      // Create snapshot with different key order
      const reordered: CertificateSnapshot = {
        issued_at: sampleSnapshot.issued_at,
        course_title: sampleSnapshot.course_title,
        student_email_hash: sampleSnapshot.student_email_hash,
        certificate_id: sampleSnapshot.certificate_id,
        completed_at: sampleSnapshot.completed_at,
        course_version: sampleSnapshot.course_version,
        student_full_name: sampleSnapshot.student_full_name,
        course_id: sampleSnapshot.course_id,
      };

      const hash1 = generateCertificateHash(sampleSnapshot);
      const hash2 = generateCertificateHash(reordered);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash if any field changes', () => {
      const original = generateCertificateHash(sampleSnapshot);

      const modified = {
        ...sampleSnapshot,
        student_full_name: 'Jane Doe', // Changed name
      };

      const modifiedHash = generateCertificateHash(modified);
      expect(modifiedHash).not.toBe(original);
    });

    it('should detect tampering with course title', () => {
      const original = generateCertificateHash(sampleSnapshot);

      const tampered = {
        ...sampleSnapshot,
        course_title: 'Automation 102', // Tampered title
      };

      const tamperedHash = generateCertificateHash(tampered);
      expect(tamperedHash).not.toBe(original);
    });
  });

  describe('verifyCertificateHash', () => {
    const sampleSnapshot: CertificateSnapshot = {
      certificate_id: 'CERT-2026-12345678-1234-1234-1234-123456789ABC',
      student_full_name: 'John Doe',
      student_email_hash: hashEmail('john@example.com'),
      course_id: 'course-uuid-123',
      course_title: 'Automation 101',
      course_version: '2026-01-01T00:00:00.000Z',
      completed_at: '2026-01-15T10:30:00.000Z',
      issued_at: '2026-01-15T11:00:00.000Z',
    };

    it('should verify valid hash', () => {
      const hash = generateCertificateHash(sampleSnapshot);
      const isValid = verifyCertificateHash(sampleSnapshot, hash);

      expect(isValid).toBe(true);
    });

    it('should reject invalid hash', () => {
      const fakeHash = 'a'.repeat(64); // Fake hash
      const isValid = verifyCertificateHash(sampleSnapshot, fakeHash);

      expect(isValid).toBe(false);
    });

    it('should detect tampering', () => {
      const originalHash = generateCertificateHash(sampleSnapshot);

      const tampered = {
        ...sampleSnapshot,
        student_full_name: 'Fake Name',
      };

      const isValid = verifyCertificateHash(tampered, originalHash);
      expect(isValid).toBe(false);
    });
  });

  describe('createCertificateSnapshot', () => {
    it('should create valid snapshot from params', () => {
      const params = {
        certificate_id: 'CERT-2026-12345678-1234-1234-1234-123456789ABC',
        student_full_name: '  John Doe  ', // With whitespace
        student_email: 'JOHN@EXAMPLE.COM', // Uppercase
        course_id: 'course-123',
        course_title: '  Automation 101  ', // With whitespace
        course_updated_at: new Date('2026-01-01'),
        completed_at: '2026-01-15T10:30:00.000Z',
        issued_at: new Date('2026-01-15T11:00:00.000Z'),
      };

      const snapshot = createCertificateSnapshot(params);

      expect(snapshot.student_full_name).toBe('John Doe'); // Trimmed
      expect(snapshot.course_title).toBe('Automation 101'); // Trimmed
      expect(snapshot.student_email_hash).toBe(hashEmail('john@example.com')); // Normalized
      expect(snapshot.course_version).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
      expect(snapshot.completed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
      expect(snapshot.issued_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
    });

    it('should handle Date objects and ISO strings consistently', () => {
      const dateObj = new Date('2026-01-15T10:30:00.000Z');
      const dateStr = '2026-01-15T10:30:00.000Z';

      const snapshot1 = createCertificateSnapshot({
        certificate_id: 'CERT-2026-TEST',
        student_full_name: 'Test',
        student_email: 'test@test.com',
        course_id: '123',
        course_title: 'Test',
        course_updated_at: dateObj,
        completed_at: dateObj,
        issued_at: dateObj,
      });

      const snapshot2 = createCertificateSnapshot({
        certificate_id: 'CERT-2026-TEST',
        student_full_name: 'Test',
        student_email: 'test@test.com',
        course_id: '123',
        course_title: 'Test',
        course_updated_at: dateStr,
        completed_at: dateStr,
        issued_at: dateStr,
      });

      expect(snapshot1.course_version).toBe(snapshot2.course_version);
      expect(snapshot1.completed_at).toBe(snapshot2.completed_at);
      expect(snapshot1.issued_at).toBe(snapshot2.issued_at);
    });

    it('should produce deterministic hash from created snapshot', () => {
      const params = {
        certificate_id: 'CERT-2026-TEST',
        student_full_name: 'John Doe',
        student_email: 'john@example.com',
        course_id: 'course-123',
        course_title: 'Test Course',
        course_updated_at: new Date('2026-01-01'),
        completed_at: new Date('2026-01-15'),
        issued_at: new Date('2026-01-15'),
      };

      const snapshot1 = createCertificateSnapshot(params);
      const snapshot2 = createCertificateSnapshot(params);

      const hash1 = generateCertificateHash(snapshot1);
      const hash2 = generateCertificateHash(snapshot2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Integration: Full workflow', () => {
    it('should support complete certificate issuance and verification workflow', () => {
      // Step 1: Create snapshot from enrollment data
      const enrollmentData = {
        certificate_id: 'CERT-2026-AAAA1111-BBBB-CCCC-DDDD-EEEE2222FFFF',
        student_full_name: 'Alice Smith',
        student_email: 'alice.smith@university.edu',
        course_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        course_title: 'Advanced Automation Techniques',
        course_updated_at: new Date('2025-12-01T00:00:00.000Z'),
        completed_at: new Date('2026-01-20T15:45:30.000Z'),
        issued_at: new Date('2026-01-21T09:00:00.000Z'),
      };

      const snapshot = createCertificateSnapshot(enrollmentData);

      // Step 2: Generate hash for storage
      const payloadHash = generateCertificateHash(snapshot);

      // Verify hash format
      expect(payloadHash).toMatch(/^[a-f0-9]{64}$/);

      // Step 3: Later verification - recompute hash from stored snapshot
      const isValid = verifyCertificateHash(snapshot, payloadHash);
      expect(isValid).toBe(true);

      // Step 4: Detect tampering attempt
      const tamperedSnapshot = {
        ...snapshot,
        course_title: 'TAMPERED TITLE',
      };

      const isTampered = verifyCertificateHash(tamperedSnapshot, payloadHash);
      expect(isTampered).toBe(false);
    });
  });
});
