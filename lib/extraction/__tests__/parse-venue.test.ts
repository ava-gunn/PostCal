import { parseVenue } from '../parse-venue';

describe('parseVenue', () => {
  it('extracts street address "450 Main St"', () => {
    const text = 'Party at 450 Main St tonight';
    expect(parseVenue(text)).toBe('450 Main St');
  });

  it('extracts venue from "at The Warehouse" pattern', () => {
    const text = 'Live music at The Warehouse';
    expect(parseVenue(text)).toBe('The Warehouse');
  });

  it('extracts venue from "@ Club Nova" pattern', () => {
    const text = 'Friday night @ Club Nova';
    expect(parseVenue(text)).toBe('Club Nova');
  });

  it('extracts venue from "venue: Central Park" label', () => {
    const text = 'venue: Central Park';
    expect(parseVenue(text)).toBe('Central Park');
  });

  it('extracts venue from "location: 123 Oak Ave" label', () => {
    const text = 'location: 123 Oak Ave';
    expect(parseVenue(text)).toBe('123 Oak Ave');
  });

  it('extracts venue from "where: The Rooftop" label', () => {
    const text = 'where: The Rooftop';
    expect(parseVenue(text)).toBe('The Rooftop');
  });

  it('does not match email addresses as venues', () => {
    const text = 'Contact us at info@venue.com for tickets';
    expect(parseVenue(text)).toBeNull();
  });

  it('does not match capitalized email addresses as venues', () => {
    const text = 'Contact us at Info@example.com for tickets';
    expect(parseVenue(text)).toBeNull();
  });

  it('does not match social handles as venues', () => {
    const text = 'Follow @djsomeone on Instagram';
    expect(parseVenue(text)).toBeNull();
  });

  it('returns null when no venue patterns found', () => {
    const text = 'Just a random event happening soon';
    expect(parseVenue(text)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseVenue('')).toBeNull();
  });
});
