import React, { useEffect, useState } from 'react';
import { Table, Popconfirm, Form, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import EditableCell from './editableCell';
import { deleteRow, updateRow } from '../redux/actions';
import 'antd/dist/antd.css';

const CandiesEditableTable = () => {
    const [editingKey, setEditingKey] = useState('');
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const candiesArray = useSelector(state => state.candiesReducer.candiesArray);
    const originData = candiesArray.map((locationObj , index) => { return {...locationObj , key:index.toString()}});
    const [data, setData] = useState(originData);

    useEffect(() => {
        setData(originData);
    },[candiesArray]);

    const isEditing = record => record.key === editingKey;

    const edit = record => {
        form.setFieldsValue({ name: '', price: '', image: '', ...record, }); 
        setEditingKey(record.key);
    };

    const cancel = () => { setEditingKey('');};

    const save = async key => {
        try {
                const row = await form.validateFields();
                const newData = [...data];
                const index = newData.findIndex(item => key === item.key);
        
                if (index > -1) {
                    const item = newData[index];
                    newData.splice(index, 1, { ...item, ...row });
                    setData(newData);
                    setEditingKey('');
                } else {
                    newData.push(row);
                    setData(newData);
                    setEditingKey('');
                }
                dispatch(updateRow(index , row));
            } 
            catch (errInfo) {
                console.log('Validate Failed:', errInfo);
            }
    };
    
    const deleteRowHandler = key => {
        const newData = [...data];
        const index = newData.findIndex(item => key === item.key);
        newData.splice(index, 1);
        setData(newData);
        dispatch(deleteRow(index));
    }

    const columns = [   {   title: 'name'      , dataIndex: 'name'      ,  width: '30%' , editable: true, }, 
                        {   title: 'price'     , dataIndex: 'price'     ,  width: '30%' , editable: true, },
                        {   title: 'image'     , dataIndex: 'image'     ,  width: '30%' , editable: true, },
                        {   title: 'operation' , dataIndex: 'operation' ,   
                            render: (_, record) => {
                                const editable = isEditing(record);                                                                               
                                return editable ? (
                                    <span>
                                        <a onClick={() => save(record.key)} style={{ marginRight: 8,}}>Save</a>
                                            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                                        <a>Cancel</a>
                                        </Popconfirm>
                                    </span>) : (
                                        <>
                                            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>Edit &nbsp;&nbsp;&nbsp;&nbsp;</Typography.Link>
                                            <Typography.Link disabled={editingKey !== ''} onClick={() => deleteRowHandler(record.key)}>Delete</Typography.Link>
                                        </>
                                    );},},
                    ];

    const mergedColumns = columns.map(col => {
                if (!col.editable) { return col; }
                        return {
                                ...col, 
                                onCell: record => ({ record, inputType: (col.dataIndex === 'price' || col.dataIndex === 'longitude') ? 'number' : 'text',
                                    dataIndex: col.dataIndex,
                                    title: col.title,
                                    editing: isEditing(record),
                            }),
                        }; 
                });
    return (
        <Form form={form} component={false}>
            <Table size="large" components={{body: {cell: EditableCell,},}} bordered dataSource={data} columns={mergedColumns} rowClassName="editable-row" pagination={{ pageSize: 5 , onChange: cancel,}} />
        </Form>
    );
};
export default CandiesEditableTable;