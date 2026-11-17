import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { buildChatBookingTarget } from "./chatBooking";
import { resolveChatLink, trimChatUrl } from "./chatLinks";

const TOKEN = /(\[[^\]\n]+\]\((?:[^\s()]|\([^\s()]*\))+\)|(?:https?:\/\/|mailto:|tel:)[^\s<>]+|\/(?:[a-z][\w/-]*)(?:\?[^\s<>]*)?(?:#[^\s<>]*)?|\*\*[^*]+\*\*|\*[^\s*](?:[^*\n]*[^\s*])?\*)/gi;

export default function ChatMessageText({ text, onNavigate, navigationLinks = null, legacyNavigationLinks = [], streaming = false }) {
  const navigate = useNavigate();
  if (!text) return null;
  function renderInline(value, depth = 0) {
    return value.split(TOKEN).map((part, index) => {
      const markdown = /^\[([^\]]+)\]\((.+)\)$/.exec(part);
      const raw = markdown?.[2] || trimChatUrl(part);
      const link = streaming ? null : resolveChatLink(raw, { origin: window.location.origin, navigationLinks, legacyNavigationLinks });
      const suffix = !markdown && part.startsWith(raw) ? part.slice(raw.length) : "";
      if (link) {
        const label = link.label || markdown?.[1] || raw;
        if (link.internal) {
          const booking = link.quoteDraft ? buildChatBookingTarget({ accommodation: { id: link.quoteDraft.accommodationId },
            checkinDate: link.quoteDraft.checkinDate, checkoutDate: link.quoteDraft.checkoutDate },
          { quote: { selectedRooms: link.quoteDraft.selectedRooms } }) : null;
          return <React.Fragment key={index}><Link to={booking?.url || link.href} state={{ chatNavigation: true }}
            onClick={(event) => {
              if (booking && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                event.preventDefault();
                navigate(booking.url, { state: { chatNavigation: true, chatBookingSelection: {
                  ...booking.draft, requestId: `text-${Date.now()}-${Math.random()}`,
                } } });
              }
              onNavigate?.();
            }}>{label}</Link>{suffix}</React.Fragment>;
        }
        return <React.Fragment key={index}><a href={link.href} target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}>{label}</a>{suffix}</React.Fragment>;
      }
      if (depth < 3 && part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={index}>{renderInline(part.slice(2, -2), depth + 1)}</strong>;
      if (depth < 3 && part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={index}>{renderInline(part.slice(1, -1), depth + 1)}</em>;
      // Do not present an unverified model URL as an actionable link.
      if (!streaming && navigationLinks !== null && (markdown || /^(?:https?:\/\/|mailto:|tel:|\/[a-z][\w/-]*(?:[?#]|$))/i.test(raw))) {
        return <React.Fragment key={index}>{markdown ? `${markdown[1]} (chưa có liên kết phù hợp)` : 'Liên kết hiện chưa khả dụng'}{suffix}</React.Fragment>;
      }
      return <React.Fragment key={index}>{markdown ? markdown[1] : part}</React.Fragment>;
    });
  }
  return String(text).split(/\r?\n/).map((line, index, lines) => <React.Fragment key={index}>
    {renderInline(line)}{index < lines.length - 1 && <br />}
  </React.Fragment>);
}
