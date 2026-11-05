import { Rating, RatingId } from './rating';

describe('Rating Domain Unit Tests', () => {
  const baseRatingInput = {
    ticketId: 'tck-123',
    customerId: 'cust-456',
    agentId: 'agent-789',
    score: 5,
    feedback: 'Atendimento muito ágil e assertivo!',
  };

  it('should create a valid rating with score 5 and feedback', () => {
    const rating = new Rating(baseRatingInput);

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.getId()).toBeInstanceOf(RatingId);

    const output = rating.getOutput();
    expect(output.score).toBe(5);
    expect(output.feedback).toBe('Atendimento muito ágil e assertivo!');
    expect(output.createdAt).toBeInstanceOf(Date);
  });

  it('should allow creating a rating without feedback text', () => {
    const rating = new Rating({
      ...baseRatingInput,
      feedback: undefined,
    });

    expect(rating.getOutput().score).toBe(5);
    expect(rating.getOutput().feedback).toBeUndefined();
  });

  it('should throw an error when score is lower than 1', () => {
    expect(() => {
      new Rating({
        ...baseRatingInput,
        score: 0,
      });
    }).toThrow('error.rating_score_must_be_between_1_and_5');
  });

  it('should throw an error when score is greater than 5', () => {
    expect(() => {
      new Rating({
        ...baseRatingInput,
        score: 6,
      });
    }).toThrow('error.rating_score_must_be_between_1_and_5');
  });
});

