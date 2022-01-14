import React, { FC, useEffect } from 'react';
import { Theme as MaterialUITheme } from '@mui/material';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import { VariableSizeList } from 'react-window';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { useMediaQuery } from '@mui/material';
import { getEvents, POAPEvent } from '../lib/blockchain/POAP';
import { useLoadingState } from '../lib/react';
import InputLoadingIcon from '../components/InputLoadingIcon';
import Tooltip from '@mui/material/Tooltip';

interface Props {
  value?: number;
  onChange?: (value: { id: number, name: string }) => void;
}

const POAPSelect: FC<Props> = (props) => {

  const [value, setValue] = React.useState(null);
  const [POAPEvents, setPoapList] = useLoadingState<{ data: { id: number, label: string }[] }>({ data: [] });

  useEffect(() => {
    if (props.value !== undefined) {
      const event = POAPEvents.data.find(e => e.id === props.value);
      if (event) {
        setValue(event);
      }
    }
  }, [props.value, POAPEvents]);

  useEffect(() => {
    getEvents().then(events => {
      const data = events
        .map(e => ({ id: e.id, label: e.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setPoapList({ data, loading: false });
    })
    .catch(error => {
      setPoapList({ error, loading: false });
      console.error(error);
    });
  }, []);

  function onChange (value: { id: number, label: string }) {
    setValue(value);
    if (props.onChange) {
      props.onChange({
        id: value.id,
        name: value.label
      });
    }
  }

  return (
    <Autocomplete<number | { id: number, label: string }>
      value={value}
      disableListWrap
      PopperComponent={StyledPopper}
      // @ts-ignore
      ListboxComponent={ListboxComponent}
      loading={POAPEvents.loading}
      renderOption={(props, option) => [props, option]}
      onChange={(e, newValue) => onChange(newValue as { id: number, label: string })}
      options={POAPEvents.data}
      sx={{ maxWidth: 300 }}
      renderInput={(params) => (
        // @ts-ignore
        <Tooltip placement='top' arrow title={params.inputProps.value}>
          <TextField {...params} InputProps={{ ...params.InputProps, endAdornment: <InputLoadingIcon loading={POAPEvents.loading} /> }} />
        </Tooltip>
      )}

    />
  );
}

const LISTBOX_PADDING = 8; // px

function renderRow (props) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: style.top + LISTBOX_PADDING,
  };
  return (
    <Typography component='li' {...dataSet[0]} noWrap style={inlineStyle}>
      <div>{dataSet[1].label}</div>
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = [];
  // @ts-ignore
  children.forEach((item) => {
    itemData.push(item);
    //itemData.push(...(item.children || []));
  });

  const theme = useTheme() as MaterialUITheme;
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });

  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.length * itemSize;
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width='100%'
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType='ul'
          itemSize={() => itemSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

export default POAPSelect;