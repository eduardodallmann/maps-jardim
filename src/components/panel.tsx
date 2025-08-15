'use client';

import { useState } from 'react';

import { FaCaretDown } from 'react-icons/fa6';

import { useShowInfos } from '~/hooks/use-show-infos';
import { polygonColors } from '~/styles/map-colors';

import { Toggle } from './common/toggle';

export function Panel() {
  const { ruas, somasPorPoligono, setRuas } = useShowInfos();
  const [openPanel, setOpenPanel] = useState(true);

  return (
    <div className="fixed top-0 right-0 m-4 bg-white p-4 rounded shadow-lg flex flex-col gap-4 min-h-14 min-w-64">
      <button
        className={`absolute right-4 p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-transform transform ${openPanel && 'rotate-180'}`}
        onClick={() => setOpenPanel(!openPanel)}
        title="Abrir/fechar painel"
      >
        <FaCaretDown />
      </button>
      {openPanel && (
        <>
          <Toggle
            label="Mostrar qnt. de casas"
            value={ruas}
            onChange={() => {
              setRuas(!ruas);
            }}
          />
          Qnts por território:
          {somasPorPoligono && (
            <table className="table-auto border-collapse">
              <thead>
                <tr>
                  <th className="border px-1 py-1">Terr.</th>
                  <th className="border px-1 py-1">Casas</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(somasPorPoligono).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      className="border px-1 py-1"
                      style={{
                        backgroundColor: `${polygonColors[Number(key)].fillColor}77`,
                      }}
                    >
                      Terr {Number(key) + 1}
                    </td>
                    <td className="border px-1 py-1">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
