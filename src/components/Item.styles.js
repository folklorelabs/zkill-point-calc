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
    width: 4em;
    height: 4em;
    margin-right: 0.667em;
    border: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const TextWrapper = styled.div`
    text-align: left;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: flex-start;
    font-weight: bold;
`;
