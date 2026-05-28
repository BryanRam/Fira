import ldap from "ldapjs";

export interface AuthenticatedLdapUser {
  dn: string;
  cn: string;
  mail: string;
}

function escapeFilterValue(value: string): string {
  return value.replace(/[\\()*\0/]/g, (char) => {
    const map: Record<string, string> = {
      "\\": "\\5c",
      "*": "\\2a",
      "(": "\\28",
      ")": "\\29",
      "\0": "\\00",
      "/": "\\2f"
    };
    return map[char] ?? char;
  });
}

export async function authenticateUser(username: string, password: string): Promise<AuthenticatedLdapUser | null> {
  const ldapUrl = process.env.LDAP_URL;
  const bindDn = process.env.LDAP_BIND_DN;
  const bindPassword = process.env.LDAP_BIND_PASSWORD;
  const baseDn = process.env.LDAP_BASE_DN;

  if (!ldapUrl || !bindDn || !bindPassword || !baseDn) {
    return null;
  }

  const client = ldap.createClient({ url: ldapUrl, timeout: 5000, connectTimeout: 5000 });

  try {
    await new Promise<void>((resolve, reject) => {
      client.bind(bindDn, bindPassword, (error) => (error ? reject(error) : resolve()));
    });

    const safeUsername = escapeFilterValue(username);
    const entry = await new Promise<ldap.SearchEntryObject | null>((resolve, reject) => {
      client.search(
        baseDn,
        {
          scope: "sub",
          filter: `(|(uid=${safeUsername})(sAMAccountName=${safeUsername})(mail=${safeUsername}))`,
          attributes: ["dn", "cn", "mail"]
        },
        (error, response) => {
          if (error) {
            reject(error);
            return;
          }

          let found: ldap.SearchEntryObject | null = null;

          response.on("searchEntry", (searchEntry) => {
            found = searchEntry.object;
          });
          response.on("error", reject);
          response.on("end", () => resolve(found));
        }
      );
    });

    if (!entry?.dn) {
      return null;
    }

    await new Promise<void>((resolve, reject) => {
      client.bind(entry.dn, password, (error) => (error ? reject(error) : resolve()));
    });

    return {
      dn: entry.dn,
      cn: String(entry.cn ?? username),
      mail: String(entry.mail ?? `${username}@example.com`)
    };
  } catch {
    return null;
  } finally {
    client.unbind();
  }
}
