import SHIPS from '../data/ships.json';
import MODULES from '../data/modules.json';

import uuid from './uuid';

export default function parseEft(eft) {
  if (!eft) throw new Error('Unable to parse EFT. Value cannot be empty.');
  const shipNameRegExp = /^\[([\w ]+)/;
  const shipNameMatch = shipNameRegExp.exec(eft);
  const shipName = shipNameMatch && shipNameMatch.length > 1 ? shipNameMatch[1] : null;
  if (!shipName) throw new Error('Unable to parse EFT. Cannot parse ship name.');
  const ship = SHIPS.find((s) => s.name === shipName);
  if (!ship) throw new Error(`Unable to parse EFT. Unknown ship ${shipName}.`);
  const eftLines = eft.split('\n');
  const eftLinesClean = eftLines
    .slice(1, eftLines.length)
    .filter((line) => !!line)
    .map((line) => line.split(',')[0]);
  const modules = eftLinesClean
    .map((line) => {
      if (/x\d+$/.test(line)) return null; // don't count drones or cargo items
      const module = MODULES.find((m) => m.name === line);
      if (!module) throw new Error(`Unable to parse EFT. Unknown module ${line}.`);
      return module ? {
        ...module,
        uuid: uuid(),
      } : null;
    })
    .filter((module) => !!module);
  return {
    ship,
    modules,
  };
}
