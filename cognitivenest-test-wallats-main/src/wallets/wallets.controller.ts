import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AddBalanceDto, TransferDto } from './dto/wallet.dto';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get(':userId')
  getWallet(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.walletsService.getWallet(userId);
  }

  @Post(':userId/add-balance')
  @HttpCode(HttpStatus.OK)
  addBalance(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AddBalanceDto,
  ) {
    return this.walletsService.addBalance(userId, dto);
  }

  @Post('transfer')
  @HttpCode(HttpStatus.OK)
  transfer(@Body() dto: TransferDto) {
    return this.walletsService.transfer(dto);
  }
}
