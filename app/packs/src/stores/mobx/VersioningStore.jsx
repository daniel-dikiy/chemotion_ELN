/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */
import { types } from 'mobx-state-tree';

export const VersioningStore = types
  .model({
    log_data: '{}',
    changed: false
  }).actions((self) => ({
    setChanged(newChanged) {
      self.changed = newChanged;
    },
    updateLogData(logData) {
      self.log_data = logData;
    }
  }));
