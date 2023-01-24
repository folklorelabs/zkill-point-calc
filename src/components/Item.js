import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { TypeEmphasis } from './TypeEmphasis';
import {
    Container,
    InnerWrapper,
    TextWrapper,
    ImageItem,
} from './Item.styles.js';

function Item({
    itemImageSrc,
    itemName,
    itemText,
    itemTooltip,
    size=0.8,
    demphasized=false,
}) {
  return (
    <Container className="Item" size={size}>
      <Tooltip title={itemTooltip}>
        <InnerWrapper>
          <ImageItem
              src={itemImageSrc}
              alt={itemName}
          />
          <TextWrapper>
            <Typography
              variant="button"
              mx={{ lineHeight: '1.333', marginBottom: '0.1em', }}
            >
              {itemName}
            </Typography>
            <Typography
              variant="overline"
              mx={{ lineHeight: '1.333' }}
            >
              {demphasized ? itemText : (<TypeEmphasis>{itemText}</TypeEmphasis>)}
            </Typography>
          </TextWrapper>
        </InnerWrapper>
      </Tooltip>
    </Container>
    );
  }
  
  export default Item;
  