interface Props {
  level: 1 | 2 | 3;
  displayLabel: string;
}

export const HeadingBlock = ({ level, displayLabel }: Props) => {
  switch (level) {
    case 1:
      return <h1>{displayLabel}</h1>;
    case 2:
      return <h2>{displayLabel}</h2>;
    case 3:
      return <h3>{displayLabel}</h3>;
  }
};
