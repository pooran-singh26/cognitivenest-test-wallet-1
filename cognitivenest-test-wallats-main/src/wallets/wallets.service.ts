import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { AddBalanceDto, TransferDto } from './dto/wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepo: Repository<Wallet>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async addBalance(userId: string, dto: AddBalanceDto): Promise<Wallet> {
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: ['wallet'],
      });

      if (!user) {
        throw new NotFoundException(`User with id "${userId}" not found.`);
      }

      const wallet = user.wallet;
      wallet.balance = Number(wallet.balance) + dto.amount;
      return manager.save(Wallet, wallet);
    });
  }

  async transfer(dto: TransferDto): Promise<{ from: Wallet; to: Wallet }> {
    const { fromUserId, toUserId, amount } = dto;

    if (fromUserId === toUserId) {
      throw new BadRequestException('Sender and receiver must be different users.');
    }

    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const [senderUser, receiverUser] = await Promise.all([
        manager.findOne(User, { where: { id: fromUserId }, relations: ['wallet'] }),
        manager.findOne(User, { where: { id: toUserId }, relations: ['wallet'] }),
      ]);

      if (!senderUser) {
        throw new NotFoundException(`User with id "${fromUserId}" not found.`);
      }
      if (!receiverUser) {
        throw new NotFoundException(`User with id "${toUserId}" not found.`);
      }

      if (Number(senderUser.wallet.balance) < amount) {
        throw new BadRequestException(
          `Insufficient balance. Available: ${senderUser.wallet.balance}, Requested: ${amount}.`,
        );
      }

      senderUser.wallet.balance = Number(senderUser.wallet.balance) - amount;
      receiverUser.wallet.balance = Number(receiverUser.wallet.balance) + amount;

      const savedSender = await manager.save(Wallet, senderUser.wallet);
      const savedReceiver = await manager.save(Wallet, receiverUser.wallet);

      return { from: savedSender, to: savedReceiver };
    });
  }

  async getWallet(userId: string): Promise<Wallet> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found.`);
    }
    return user.wallet;
  }
}
