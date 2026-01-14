import React from 'react';
import { Table, TableProps } from 'antd';

interface DataTableProps<T> extends TableProps<T> {
  loading?: boolean;
}

const DataTable = <T extends object>({ loading, ...props }: DataTableProps<T>) => {
  return (
    <Table
      {...props}
      loading={loading}
    />
  );
};

export default DataTable;
