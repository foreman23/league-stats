import React from 'react';
import { Tooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

// Dark modern tooltip — drop-in replacement for MUI <Tooltip>.
// Accepts all MUI Tooltip props; defaults to arrow + top placement.
// Convenience: `offset={[x, y]}` builds the popper offset modifier so call
// sites don't have to spell out the verbose slotProps.popper.modifiers form.
const Styled = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#1A1C20',
    color: '#FFFFFF',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.2px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.35)',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#1A1C20',
    '&::before': { border: '1px solid rgba(255, 255, 255, 0.08)' },
  },
}));

export default function StyledTooltip({
  arrow = true,
  placement = 'top',
  offset,
  slotProps,
  ...props
}) {
  const mergedSlotProps = offset
    ? {
        ...slotProps,
        popper: {
          ...slotProps?.popper,
          modifiers: [
            ...(slotProps?.popper?.modifiers ?? []),
            { name: 'offset', options: { offset } },
          ],
        },
      }
    : slotProps;

  return (
    <Styled
      arrow={arrow}
      placement={placement}
      slotProps={mergedSlotProps}
      {...props}
    />
  );
}
