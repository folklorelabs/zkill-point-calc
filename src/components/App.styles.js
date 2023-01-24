import styled from '@emotion/styled';

export const NestedItemList = styled.ul`
    margin-left: 1.2em;
    padding-left: 1.2em;
    border-bottom: none;
    border-left-style: solid;
    border-left-width: 1px;
    border-image: 
    linear-gradient(
        to bottom, 
        ${({ theme }) => theme.palette.divider},
        ${({ theme }) => theme.palette.divider} 75%,
        rgba(0, 0, 0, 0)
    ) 1 100%;
`;
