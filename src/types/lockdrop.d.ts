export type LockdropEvent = {
  id: number;
  addr: string;
  reward_token_addr: string;
  lp_token_addr: string;
  total_locked_lp: string;
  total_reward: string;
  start_at: number;
  end_at: number;
  cancelable_until: number;
};

export interface LockdropEvents {
  events: LockdropEvent[];
}

export type LockdropLockupInfo = {
  duration: number;
  unlock_second: number;
  locked_lp_token: string;
  weighted_score: string;
  total_reward: string;
  claimable: string;
  claimed: string;
};

export interface LockdropUserInfo {
  lp_token_addr: string;
  lockdrop_total_locked_lp_token: string;
  lockdrop_total_reward: string;
  user_total_locked_lp_token: string;
  user_total_reward: string;
  lockup_infos: LockdropLockupInfo[];
}

export type LockdropEstimatedReward = {
  lockdrop_total_reward: string;
  estimated_reward: string;
};
