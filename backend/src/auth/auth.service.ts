import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(email?: string, password?: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    return {
      accessToken: 'development-token',
      user: { email },
    };
  }
}
