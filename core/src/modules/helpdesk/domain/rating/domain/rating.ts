import { Entity } from '../../../../../domain/entity';
import Input from '../../../../../domain/input';
import Output from '../../../../../domain/output';
import { RatingId } from './rating.id';
import { RatingRules } from './rating.rules';

export interface RatingInput extends Input {
  ticketId: string;
  customerId: string;
  agentId: string;
  score: number;
  feedback?: string;
}

export interface RatingOutput extends Output {
  ticketId: string;
  customerId: string;
  agentId: string;
  score: number;
  feedback?: string;
}

export * from './rating.id';
export class Rating extends Entity {
  private readonly id: RatingId;
  private readonly ticketId: string;
  private readonly customerId: string;
  private readonly agentId: string;
  private readonly score: number;
  private readonly feedback?: string;

  constructor(input: RatingInput) {
    super(input);
    if (input.score < 1 || input.score > 5) {
      throw new Error('error.rating_score_must_be_between_1_and_5');
    }

    this.id = input.id ? new RatingId(input.id) : new RatingId();
    this.ticketId = input.ticketId;
    this.customerId = input.customerId;
    this.agentId = input.agentId;
    this.score = input.score;
    this.feedback = input.feedback;

    this.validate(new RatingRules(this.getOutput()));
  }

  public getId(): RatingId {
    return this.id;
  }

  public getOutput(): RatingOutput {
    return {
      id: this.id.id,
      ticketId: this.ticketId,
      customerId: this.customerId,
      agentId: this.agentId,
      score: this.score,
      feedback: this.feedback,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
