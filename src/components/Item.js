import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
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
        <Container className="Item" size={size} demphasized={demphasized}>
            <Tooltip title={itemTooltip}>
                <InnerWrapper>
                    <ImageItem
                        src={itemImageSrc}
                        alt={itemName}
                    />
                    <TextWrapper>
                        <Typography variant="button" mx={{ lineHeight: '1.333', marginBottom: '0.1em', }}>{itemName}</Typography>
                        <Typography variant="overline" mx={{ lineHeight: '1.333' }}>{itemText}</Typography>
                    </TextWrapper>
                </InnerWrapper>
            </Tooltip>
        </Container>
    );
  }
  
  export default Item;
  