import styled from '@emotion/styled';

export const Container = styled.div`
    opacity: ${({ demphasized }) => demphasized ? 0.6 : 1};
    font-size: ${({ size }) => size}em;
    cursor: help;
`;

export const InnerWrapper = styled.div`
    display: flex;
`;

export const ImageItem = styled.img`
    display: block;
    width: 3.15em;
    height: 3.15em;
    margin-right: 0.667em;
    border: 1px solid rgba(0, 0, 0, 0.1);
`;

export const TextWrapper = styled.div`
    text-align: left;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: flex-start;
    font-weight: bold;
`;

export const TextPrimary = styled.span`
    font-size: 1.333em;
    line-height: 1.15em;
    margin-bottom: 0.1em;
`;

export const TextSecondary = styled.span`
    text-transform: uppercase;
    font-size: 0.9em;
    opacity: 0.8;
`;