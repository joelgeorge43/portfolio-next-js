import { Row, IconButton, SmartLink, Text } from "@once-ui-system/core";
import { person, social } from "@/resources";
import styles from "./Footer.module.scss";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Row as="footer" fillWidth padding="8" horizontal="center" s={{ direction: "column" }}>
      <Row
        className={styles.mobile}
        fillWidth
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        horizontal="center"
        vertical="center"
        style={{ position: "relative" }}
        s={{
          direction: "column",
          gap: "16",
        }}
      >
        <Text variant="body-default-s" onBackground="neutral-strong" align="center">
          <Text onBackground="neutral-weak">© {currentYear} Designed. Engineered. Elevated.</Text>
          <Text paddingX="4">-</Text>
          <Text>Joel George</Text>
        </Text>
        
        <Row 
            gap="16" 
            style={{ position: "absolute", right: "16px" }}
            s={{ position: "static" }}
        >
          {social.map(
            (item) =>
              item.link && (
                <IconButton
                  key={item.name}
                  href={item.link}
                  icon={item.icon}
                  tooltip={item.name}
                  size="s"
                  variant="ghost"
                />
              ),
          )}
        </Row>
      </Row>
      <Row height="80" hide s={{ hide: false }} />
    </Row>
  );
};
