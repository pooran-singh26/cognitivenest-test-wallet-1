import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class AddBalanceDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount: number;
}

export class TransferDto {
  @IsUUID()
  fromUserId: string;

  @IsUUID()
  toUserId: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  amount: number;
}
