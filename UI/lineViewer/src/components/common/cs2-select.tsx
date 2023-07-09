
import Select, { ActionMeta, GroupBase, OnChangeValue, OptionsOrGroups, PropsValue } from 'react-select';

export default <Option, Group extends GroupBase<Option>>(props: {
    options: OptionsOrGroups<Option, Group>,
    onChange?: (newValue: Option, actionMeta: ActionMeta<Option>) => void
    value?: PropsValue<Option>
}) => <>
        <Select
            options={props.options}
            className="react-select-container"
            aria-live="off"
            closeMenuOnSelect={false}
            classNames={{
                valueContainer: () => "value-container",
                control: () => "value-control",
                indicatorsContainer: () => "indicators-container",
                menuList: () => "menu-list",
                menu: () => "list-box",
                option: () => "option",
                input: () => "input"
            }}
            onChange={props.onChange}
            value={props.value}
        />
    </>