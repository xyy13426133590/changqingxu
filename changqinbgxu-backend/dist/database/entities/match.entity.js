"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let Match = class Match {
};
exports.Match = Match;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Match.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Match.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_user_id' }),
    __metadata("design:type", String)
], Match.prototype, "targetUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['like', 'dislike', 'super_like'],
    }),
    __metadata("design:type", String)
], Match.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_mutual', default: false }),
    __metadata("design:type", Boolean)
], Match.prototype, "isMutual", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.matches),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Match.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.matches),
    (0, typeorm_1.JoinColumn)({ name: 'target_user_id' }),
    __metadata("design:type", user_entity_1.User)
], Match.prototype, "targetUser", void 0);
exports.Match = Match = __decorate([
    (0, typeorm_1.Entity)('matches'),
    (0, typeorm_1.Index)(['userId', 'targetUserId'], { unique: true })
], Match);
//# sourceMappingURL=match.entity.js.map