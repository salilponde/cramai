import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CopilotkitModule } from './copilotkit/copilotkit.module';

@Module({
  imports: [CopilotkitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
