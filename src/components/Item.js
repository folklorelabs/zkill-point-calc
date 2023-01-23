import Tooltip from '@mui/material/Tooltip';
import {
    Container,
    InnerWrapper,
    TextWrapper,
    TextPrimary,
    TextSecondary,
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
        <Container className="Item" size={size} demphasized={demphasized}>
            <Tooltip title={itemTooltip}>
                <InnerWrapper>
                    <ImageItem
                        src={itemImageSrc}
                        alt={itemName}
                    />
                    <TextWrapper>
                        <TextPrimary>{itemName}</TextPrimary>
                        <TextSecondary>{itemText}</TextSecondary>
                    </TextWrapper>
                </InnerWrapper>
            </Tooltip>
        </Container>
    );
  }
  
  export default Item;
  