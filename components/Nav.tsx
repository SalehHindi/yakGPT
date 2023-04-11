import {
  createStyles,
  Navbar,
  Group,
  getStylesRef,
  rem,
  Tooltip,
  ActionIcon,
  Text,
  Modal,
  useMantineColorScheme,
  Box,
  MediaQuery,
  Burger,
} from "@mantine/core";
import { upperFirst, useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconPlus,
  IconTrash,
  IconSettings,
  IconMoon,
  IconSun,
  IconKey,
} from "@tabler/icons-react";
import { useChatStore } from "@/stores/ChatStore";
import KeyModal from "./KeyModal";
import SettingsModal from "./SettingsModal";
import { useUser } from '@auth0/nextjs-auth0/client';


const useStyles = createStyles((theme) => ({
  header: {
    paddingBottom: theme.spacing.md,
    marginBottom: `calc(${theme.spacing.md} * 1.5)`,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },

  footer: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,
  },

  link: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: theme.fontSizes.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    padding: `${theme.spacing.xs} ${theme.spacing.xs}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    // im a noob
    flexGrow: "1 !important",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,

      [`& .${getStylesRef("icon")}`]: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
      [`& .${getStylesRef("icon")}`]: {
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
      },
    },
  },

  scrollbar: {
    scrollbarWidth: "thin",
    scrollbarColor: "transparent transparent",

    "&::-webkit-scrollbar": {
      width: "6px",
    },

    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },

    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "transparent",
      borderRadius: "20px",
    },
  },
}));

export default function NavbarSimple() {
  const { classes, cx, theme } = useStyles();

  const { user, error, isLoading } = useUser();




  const [openedKeyModal, { open: openKeyModal, close: closeKeyModal }] =
    useDisclosure(false);
  const [
    openedSettingsModal,
    { open: openSettingsModal, close: closeSettingsModal },
  ] = useDisclosure(false);

  const addChat = useChatStore((state) => state.addChat);
  const deleteChat = useChatStore((state) => state.deleteChat);

  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const activeChatId = useChatStore((state) => state.activeChatId);

  const navOpened = useChatStore((state) => state.navOpened);
  const setNavOpened = useChatStore((state) => state.setNavOpened);

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const Icon = colorScheme === "dark" ? IconSun : IconMoon;

  const isSmall = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const links = chats.map((chat) => (
    <Group
      position="apart"
      key={chat.id}
      sx={{
        position: "relative",
        maskImage:
          chat.id === activeChatId
            ? ""
            : "linear-gradient(to right, black 80%, transparent 110%)",
      }}
    >
      <a
        className={cx(classes.link, {
          [classes.linkActive]: chat.id === activeChatId,
        })}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          setActiveChat(chat.id);
          if (isSmall) {
            setNavOpened(false);
          }
        }}
      >
        <Box>
          <Text size="xs" weight={500} color="dimmed" truncate>
            {chat.title || "Untitled"}
          </Text>
        </Box>
      </a>
      <Tooltip label="Delete" withArrow position="right">
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            deleteChat(chat.id);
            // If there are no more chats, create one
            if (chats.length === 1) {
              addChat();
            }
          }}
          style={{
            position: "absolute",
            right: -5,
          }}
        >
          {chat.id === activeChatId && (
            <ActionIcon
              variant="default"
              size={18}
              sx={{
                boxShadow: `8px 0 16px 20px ${
                  theme.colorScheme === "dark" ? theme.colors.dark[7] : "white"
                }`,
              }}
            >
              <IconTrash size="0.8rem" stroke={1.5} />
            </ActionIcon>
          )}
        </a>
      </Tooltip>
    </Group>
  ));

  links.reverse();

  return (<div>
    {user &&
  
   <Navbar
     height={"100%"}
     p="md"
     hiddenBreakpoint="sm"
     hidden={!navOpened}
     width={{ sm: 200, lg: 250 }}
     sx={{ zIndex: 1001 }}
   >
     <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
       <Navbar.Section className={classes.header}>
         <a
           href="#"
           className={classes.link}
           onClick={(event) => {
             event.preventDefault();
             addChat();
           }}
         >
           <IconPlus className={classes.linkIcon} stroke={1.5} />
           <span>New Chat</span>
           <MediaQuery largerThan="sm" styles={{ display: "none" }}>
             <Burger
               opened={navOpened}
               onClick={() => setNavOpened(!navOpened)}
               size="sm"
               color={theme.colors.gray[6]}
               mr="xl"
             />
           </MediaQuery>
         </a>
       </Navbar.Section>
     </MediaQuery>

     <MediaQuery smallerThan="sm" styles={{ marginTop: rem(36) }}>
       <Navbar.Section
         grow
         mx="-xs"
         px="xs"
         className={classes.scrollbar}
         style={{
           overflowX: "hidden",
           overflowY: "scroll",
         }}
       >
         {links}
       </Navbar.Section>
     </MediaQuery>
     <Navbar.Section className={classes.footer}>
       <a
         href="#"
         className={classes.link}
         onClick={() => toggleColorScheme()}
       >
         <Icon className={classes.linkIcon} stroke={1.5} />
         <span>
           {upperFirst(colorScheme === "light" ? "dark" : "light")} theme
         </span>
       </a>

       <Modal opened={openedKeyModal} onClose={closeKeyModal} title="API Key">
         <KeyModal close={closeKeyModal} />
       </Modal>

       <a
         href="#"
         className={classes.link}
         onClick={(event) => {
           event.preventDefault();
           openedSettingsModal && closeSettingsModal();
           openKeyModal();
           if (isSmall) setNavOpened(false);
         }}
       >
         <IconKey className={classes.linkIcon} stroke={1.5} />
         <span>API Key2</span>
       </a>

       <Modal
         opened={openedSettingsModal}
         onClose={closeSettingsModal}
         title="Settings"
       >
         <SettingsModal close={closeSettingsModal} />
       </Modal>

       <a
         href="#"
         className={classes.link}
         onClick={(event) => {
           event.preventDefault();
           openedKeyModal && closeKeyModal();
           openSettingsModal();

           if (isSmall) setNavOpened(false);
         }}
       >
         <IconSettings className={classes.linkIcon} stroke={1.5} />
         <span>Settings</span>
       </a>
     </Navbar.Section>
   </Navbar>
}</div>
    );
}
