const paths = {
  dashboard: [
    'M4 4h6v7H4z',
    'M14 4h6v4h-6z',
    'M14 12h6v8h-6z',
    'M4 15h6v5H4z',
  ],
  exam: ['M6 3h9l3 3v15H6z', 'M14 3v4h4', 'M9 11h6', 'M9 15h6'],
  plus: ['M12 5v14', 'M5 12h14'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  chart: ['M4 19V9', 'M10 19V5', 'M16 19v-7', 'M22 19H2'],
  logout: ['M10 17l5-5-5-5', 'M15 12H3', 'M15 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20', 'M12 6v6l4 2'],
  check: ['M20 6 9 17l-5-5'],
  warning: ['M12 3 2 21h20z', 'M12 9v4', 'M12 17h.01'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20', 'M12 11v6', 'M12 7h.01'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 15H6L5 6', 'M10 11v6', 'M14 11v6'],
  edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z'],
  eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6'],
  chevron: ['m9 18 6-6-6-6'],
  arrowLeft: ['M19 12H5', 'm12 19-7-7 7-7'],
  arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
  spark: ['m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z', 'm19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z'],
  book: ['M4 4h6a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H4z', 'M20 4h-4a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h4z'],
  trophy: ['M8 4h8v5a4 4 0 0 1-8 0z', 'M6 5H3v2a4 4 0 0 0 4 4', 'M18 5h3v2a4 4 0 0 1-4 4', 'M12 13v4', 'M8 21h8', 'M9 17h6'],
  refresh: ['M20 6v5h-5', 'M4 18v-5h5', 'M6.1 9A7 7 0 0 1 18 6l2 5', 'M17.9 15A7 7 0 0 1 6 18l-2-5'],
  save: ['M5 3h12l2 2v16H5z', 'M8 3v6h8V3', 'M8 21v-7h8v7'],
  play: ['M7 4v16l13-8z'],
};

export function Icon({ name, size = 20, strokeWidth = 1.8, className = '' }) {
  const iconPaths = paths[name] ?? paths.info;
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths.map((path) => (
        <path
          d={path}
          key={path}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      ))}
    </svg>
  );
}
