export const OptionsNav = [
  {
    name: "Home",
    isSublist: false,
    to: "/",
    logo: "bi bi-grid",
  },
  {
    name: "About",
    isSublist: true,
    sublist: [
      {
        name: "About inside",
        to: "/about",
      },
    ],
    logo: "bi bi-info-circle",
  },
  {
    name: "Error",
    isSublist: false,
    to: "/error",
    logo: "bi bi-dash-circle",
  },
  {
    name: "Partidos",
    isSublist: false,
    to: "/mathes",
    logo: "bi bi-dash-circle",
  },
];
