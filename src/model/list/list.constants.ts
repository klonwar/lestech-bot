import * as moment from 'moment/moment';

export const positions = {
  datetime: [2, 0],
  places: [10, 0],
  listStart: [13, 0],
  id: [13, 1],
  document: [13, 2],
  snils: [13, 3],
  score: [13, 6],
};

export const getCellInTable = (
  table: string[][],
  key: keyof typeof positions,
) => table[positions[key][0]][positions[key][1]];

export const getCellInRow = (row: string[], key: keyof typeof positions) =>
  row[positions[key][1]];

export const parseDate = (date: string) =>
  moment(
    date.match(/\d{2}[.:]\d{2}[.:]\d{2,4}/g).join(' '),
    'DD.MM.YYYY HH:mm:SS',
  );
