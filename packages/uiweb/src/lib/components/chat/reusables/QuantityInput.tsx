import React, { ChangeEvent, useContext } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import { ThemeContext } from '../theme/ThemeProvider';
import { IChatTheme } from '../theme';
import { DropdownValueType } from './DropDown';
import { Section, Span } from '../../reusables';
import { DropDownInput } from './DropDownInput';
import { device } from '../../../config';

export type InputType = { value: number; range: number };
export interface IQuantityInputProps {
  labelName?: string;
  inputValue: InputType;
  placeholder?: string;
  unit: string;
  onInputChange: any;
  dropDownValues: DropdownValueType[];
}

export const QuantityInput = (props: IQuantityInputProps) => {
  const theme = useContext(ThemeContext);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onInputChange(event);
  };

  return (
    <ThemeProvider theme={theme}>
      <QuantityInputContainer>
        <LabelContainer>
          <label>{props.labelName}</label>
        </LabelContainer>
        <Section gap="4px" alignItems="center" justifyContent='space-between'>
          <Section >
          <DropDownInput
            selectedValue={props.inputValue.range}
            dropdownValues={props.dropDownValues}
          />
          </Section>
          <Section alignItems="baseline" >
            <Input
              type="number"
              theme={theme}
              value={props.inputValue.value}
              onChange={handleChange}
              placeholder={props.placeholder}
            />
            <Unit

              borderRadius="0 12px 12px 0"
              background={theme.backgroundColor?.modalHoverBackground}
              border={theme.border?.modalInnerComponents}
              width='20%'
             
            >
              {props.unit}
            </Unit>
          </Section>
        </Section>
      </QuantityInputContainer>
    </ThemeProvider>
  );
};

/* styling */
const QuantityInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  font-family: ${(props) => props.theme.fontFamily};
`;

const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;

  font-weight: 500;
  font-size: 16px;
  color: ${(props) => props.theme.textColor?.modalHeadingText ?? '#000'};
`;
const Input = styled.input<IChatTheme>`
  padding: 16px;
  margin-top: 8px;
  color: ${(props) => props.theme.textColor?.modalHeadingText ?? '#000'};

  background: ${(props) => props.theme.backgroundColor.modalInputBackground};
  border: ${(props) => props.theme.border.modalInnerComponents};
  border-width: 1px 0px 1px 1px;
  border-radius: 12px 0 0 12px;
  font-family: ${(props) => props.theme.fontFamily};
  font-size: 16px;
  width:80%;
  font-weight: 500;
`;

const Unit = styled(Span)<IChatTheme>`
font-size:16px;
font-weight:700;
padding:16px;
@media ${device.mobileL} {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  padding: 18.5px 19px 16.5px 13px;
}
`;