import React from 'react';
import { Icon } from 'react-icons-kit';
import { loader } from 'react-icons-kit/feather';
import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';

const Spinner = ({ size }) => {
  const COLORS = useSelector((state) => state.designSetting);
  return <Spinning size={size} icon={loader} colors={COLORS} />;
};
const spin = keyframes`
  from {
    transform: rotate(0deg)
  }
  to {
    transform: rotate(360deg)
  }
`;

const Spinning = styled(Icon)`
  color: ${(props) => props.colors.filter};
  @media (prefers-reduced-motion: no-preference) {
    animation: ${spin} 1000ms infinite;
  }
`;

export default Spinner;
