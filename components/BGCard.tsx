import {
  Card,
  Text,
  Group,
  createStyles,
  getStylesRef,
  rem,
} from "@mantine/core";
import { MouseEventHandler } from "react";
import Image from "next/image";

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    height: rem(280),
    backgroundColor: "white",
      // theme.colorScheme === "dark"
      //   ? theme.colors.dark[6]
      //   : theme.colors.gray[0],

    [`&:hover .${getStylesRef("image")}`]: {
      transform: "scale(1.03)",
    },
  },

  image: {
    ...theme.fn.cover(),
    ref: getStylesRef("image"),
    transition: "transform 500ms ease",
    marginTop: rem(-9),
    marginLeft: rem(-6),
    width: '20vw',
    height: '20vw'
  },

  overlay: {
    position: "absolute",
    top: "20%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage:
      "linear-gradient(180deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, .85) 80%)",
  },

  content: {
    height: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    zIndex: 1,
  },

  title: {
    color: theme.colors.dark[7],
    marginBottom: rem(5),
  },

  description: {
    color: theme.colors.dark[7],
  },
}));

interface ImageCardProps {
  // image: string;
  title: string;
  description: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function ImageCard({
  // image,
  title,
  description,
  onClick,
}: ImageCardProps) {
  const { classes, theme } = useStyles();

  return (
    <Card
      p="lg"
      shadow="lg"
      className={classes.card}
      radius="md"
      component="a"
      href="#"
      onClick={onClick}
    >
      <div className={classes.image}>
        {/* <Image
          src={image}
          fill
          sizes="(width: 20vw) 20vw,
                  (height: 20vw) 20vw,
                  20vw"
          alt={title}
        /> */}
      </div>
      <div className={classes.overlay} />

      <div className={classes.content}>
        <div>
          <Text size="lg" className={classes.title} weight={500}>
            {title}
          </Text>

          <Group position="apart" spacing="xs">
            <Text size="sm" className={classes.description}>
              {description}
            </Text>
          </Group>
        </div>
      </div>
    </Card>
  );
}
