import moment from 'moment';

export function formatDob(dob) {
  return dob ? moment(dob).format('YYYY=MM-DD') : '';
}
