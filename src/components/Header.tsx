import { useState } from "react";
import { Avatar } from "./catalyst/avatar";
import * as Headless from "@headlessui/react";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
  DropdownDivider,
} from "./catalyst/dropdown";
import { NavbarItem } from "./catalyst/navbar";
import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import { Heading, Subheading } from "./catalyst/heading";
import { Switch } from "./catalyst/switch";
import { Label } from "./catalyst/fieldset";

// Custom styles to fix dropdown animation
const customDropdownStyles = {
  animation: "none",
  transform: "none",
  opacity: 1,
  transition: "opacity 150ms ease-out",
};

const Header = () => {
  const [storeChats, setStoreChats] = useState(false);

  return (
    <div className="navbar bg-[#1e1e1e] fixed top-0 left-0 right-0 z-10">
      <div className="flex-1 xl:w-[15%]">
        <a className="btn btn-ghost">
          <Heading>Fyler</Heading>
        </a>
      </div>

      {/* Empty middle section on large screens */}
      <div className="hidden xl:block xl:flex-1 xl:w-[70%]"></div>

      <div className="flex-none xl:w-[15%] flex justify-end gap-6">
        <Headless.Field className="flex items-center gap-2">
          <Label>
            <Subheading>Temporary</Subheading>
          </Label>
          <Switch
            name="allow_embedding"
            checked={storeChats}
            onChange={() => setStoreChats(!storeChats)}
          />
        </Headless.Field>
        <Dropdown>
          <DropdownButton as={NavbarItem} aria-label="Account menu">
            <Avatar src="/profile.png" square />
          </DropdownButton>
          <DropdownMenu
            className="min-w-64 z-20"
            anchor="bottom end"
            style={customDropdownStyles}
          >
            <DropdownItem href="/my-profile">
              <UserIcon />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <Cog8ToothIcon />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/privacy-policy">
              <ShieldCheckIcon />
              <DropdownLabel>Privacy policy</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/share-feedback">
              <LightBulbIcon />
              <DropdownLabel>Share feedback</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/logout">
              <ArrowRightStartOnRectangleIcon />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
