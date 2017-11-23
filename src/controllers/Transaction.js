import Boom from 'boom';
import TransactionModel from 'models/Transaction';
import FamilyModel from 'models/Family';
import { isOffline } from 'utils/db-client';

export default class WithdrawalController {
  constructor() {
    this.transaction = new TransactionModel();
    this.family = new FamilyModel();
  }

  async listByFamily(userId, familyId, lastEvaluatedKey, limit) {
    // check if user is family member
    if (!(isOffline() || await this.family.checkIsFamilyMember(familyId, userId))) {
      throw Boom.badRequest('Disallowed to see other family\'s data');
    }

    return this.transaction.fetchByFamilyId(familyId, lastEvaluatedKey, limit);
  }

  async listByFamilyMember(userId, familyId, lastEvaluatedKey, limit) {
    // check if user is family member
    if (!(isOffline() || await this.family.checkIsFamilyMember(familyId, userId))) {
      throw Boom.badRequest('Disallowed to see other family\'s data');
    }

    return this.transaction.fetchByFamilyMember(familyId, userId, lastEvaluatedKey, limit);
  }
}
