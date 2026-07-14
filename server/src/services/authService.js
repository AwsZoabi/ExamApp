import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { conflict, forbidden, unauthorized } from '../utils/errors.js';

const publicUser = (user) => ({
  id: Number(user.id),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export class AuthService {
  constructor({ repository, config }) {
    this.repository = repository;
    this.config = config;
  }

  #createToken(user) {
    return jwt.sign(
      { role: user.role, email: user.email },
      this.config.jwtSecret,
      {
        subject: String(user.id),
        expiresIn: this.config.jwtExpiresIn,
        issuer: 'examapp-api',
        audience: 'examapp-client',
      },
    );
  }

  async login({ email, password }, context = {}) {
    const user = await this.repository.findUserByEmail(email);
    const validPassword = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!user || !validPassword || user.isActive === false) {
      throw unauthorized('Invalid email or password');
    }

    await this.repository.createAuditLog({
      actorId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      requestId: context.requestId,
    });

    return { token: this.#createToken(user), user: publicUser(user) };
  }

  async register(input, context = {}) {
    const role = input.role ?? 'student';

    if (role === 'teacher' && !this.config.allowTeacherRegistration) {
      throw forbidden('Public teacher registration is disabled');
    }

    if (await this.repository.findUserByEmail(input.email)) {
      throw conflict('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, this.config.bcryptRounds);
    const user = await this.repository.createUser({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role,
    });

    await this.repository.createAuditLog({
      actorId: user.id,
      action: 'auth.register',
      entityType: 'user',
      entityId: user.id,
      requestId: context.requestId,
      metadata: { role },
    });

    return { token: this.#createToken(user), user: publicUser(user) };
  }

  async authenticateToken(token) {
    let payload;

    try {
      payload = jwt.verify(token, this.config.jwtSecret, {
        issuer: 'examapp-api',
        audience: 'examapp-client',
      });
    } catch {
      throw unauthorized('Token is invalid or expired');
    }

    const user = await this.repository.findUserById(Number(payload.sub));

    if (!user || user.isActive === false) {
      throw unauthorized('Token user no longer exists');
    }

    return publicUser(user);
  }
}
