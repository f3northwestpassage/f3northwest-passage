// src/app/_components/Button.tsx

import Link from 'next/link';

// Define the props for the Button component
interface ButtonProps {
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  disabled?: boolean;
  className?: string;
  bare?: boolean;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  href,
  target,
  disabled = false,
  className = '',
  bare = false,
  type = 'button',
  ...rest
}) => {
  // Default base styles based on the user's latest input
  const defaultButtonStyles =
    'border-solid border-2 border-drp rounded text-drp uppercase font-medium font-blackops py-2 px-3 text-xl';

  // Bare styles override the defaultButtonStyles if `bare` is true
  const bareStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-200 text-f3-blue-light hover:text-white dark:text-f3-blue-light dark:hover:text-f3-blue';

  // Styles based on the `bare` prop
  const baseStyles = bare ? bareStyles : defaultButtonStyles;

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Combine all styles. Custom className is applied last to allow overrides.
  const combinedStyles = `${baseStyles} ${disabledStyles} ${className}`.trim();

  // If href is provided, render a Next.js Link wrapping an actual button
  if (href) {
    return (
      <Link href={href} target={target} passHref>
        <button
          type={type}
          className={combinedStyles}
          disabled={disabled}
          onClick={onClick}
          {...rest}
        >
          {text}
        </button>
      </Link>
    );
  }

  // Otherwise, render a standard button for actions without navigation
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      {...rest}
    >
      {text}
    </button>
  );
};

export default Button;
