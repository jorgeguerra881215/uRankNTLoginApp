import json
import pandas as pd
import re
from keras.preprocessing.sequence import pad_sequences
from sklearn.cluster import KMeans
from sklearn.model_selection import KFold
from sklearn.metrics import classification_report


import numpy as np

training_feature_subset = ['sp', 'wp', 'wnp', 'snp', 'ds', 'dm', 'dl', 'ss', 'sm', 'sl']


def load_settings_json():
    import os
    script_path = os.path.dirname(os.path.abspath( __file__ ))

    script_path = "/".join(script_path.split("/")[0:-1])

    settings_path = script_path + "/app_settings.json"

    with open(settings_path, 'r') as f:
        settings_json = json.load(f)

    return settings_json

settings_json = load_settings_json()

def dataset_cleaning(ds_sliced):
    ds_cleaned = pd.DataFrame()

    ds_cleaned['id'] = ds_sliced['id']
    ds_cleaned['label'] = ds_sliced['title']
    ds_cleaned['char_encoding'] = ds_sliced['description']

    ds_cleaned['src_ip'] = ds_sliced.connection_id.map(lambda x: x.split("-")[0])
    ds_cleaned['dest_ip'] = ds_sliced.connection_id.map(lambda x: x.split("-")[1])
    ds_cleaned['protocol'] = ds_sliced.connection_id.map(lambda x: x.split("-")[3])
    ds_cleaned['port'] = ds_sliced.connection_id.map(lambda x: x.split("-")[2])

    def str_count(str_regex, str_):
        return len(re.findall(str_regex, str_))

    ds_cleaned['modelsize'] = ds_cleaned.char_encoding.map(lambda x: len(x))

    ds_cleaned['sp'] = ds_cleaned.char_encoding.map(lambda x: str_count('[a-i]', x))
    ds_cleaned['wp'] = ds_cleaned.char_encoding.map(lambda x: str_count('[A-I]', x))
    ds_cleaned['wnp'] = ds_cleaned.char_encoding.map(lambda x: str_count('[r-z]', x))
    ds_cleaned['snp'] = ds_cleaned.char_encoding.map(lambda x: str_count('[R-Z]', x))

    ds_cleaned['ds'] = ds_cleaned.char_encoding.map(lambda x: str_count('(a|A|r|R|1|d|D|u|U|4|g|G|x|X|7)', x))
    ds_cleaned['dm'] = ds_cleaned.char_encoding.map(lambda x: str_count('(b|B|s|S|2|e|E|v|V|5|h|H|y|Y|8)', x))
    ds_cleaned['dl'] = ds_cleaned.char_encoding.map(lambda x: str_count('(c|C|t|T|3|f|F|w|W|6|i|I|z|Z|9)', x))

    ds_cleaned['ss'] = ds_cleaned.char_encoding.map(lambda x: str_count('[a-c]', x) + str_count('[A-C]', x) + str_count('[r-t]', x) + str_count('[R-T]', x) + str_count('[1-3]', x))
    ds_cleaned['sm'] = ds_cleaned.char_encoding.map(lambda x: str_count('[d-f]', x) + str_count('[D-F]', x) + str_count('[u-w]', x) + str_count('[U-W]', x) + str_count('[4-6]', x))
    ds_cleaned['sl'] = ds_cleaned.char_encoding.map(lambda x: str_count('[g-i]', x) + str_count('[G-I]', x) + str_count('[x-z]', x) + str_count('[X-Z]', x) + str_count('[7-9]', x))

    ds_cleaned['sp'] = ds_cleaned['sp'] / ds_cleaned['modelsize']
    ds_cleaned['wp'] = ds_cleaned['wp'] / ds_cleaned['modelsize']
    ds_cleaned['wnp'] = ds_cleaned['wnp'] / ds_cleaned['modelsize']
    ds_cleaned['snp'] = ds_cleaned['snp'] / ds_cleaned['modelsize']

    ds_cleaned['ds'] = ds_cleaned['ds'] / ds_cleaned['modelsize']
    ds_cleaned['dm'] = ds_cleaned['dm'] / ds_cleaned['modelsize']
    ds_cleaned['dl'] = ds_cleaned['dl'] / ds_cleaned['modelsize']

    ds_cleaned['ss'] = ds_cleaned['ss'] / ds_cleaned['modelsize']
    ds_cleaned['sm'] = ds_cleaned['sm'] / ds_cleaned['modelsize']
    ds_cleaned['sl'] = ds_cleaned['sl'] / ds_cleaned['modelsize']

    return ds_cleaned

# k-means for clustering
def enrich_with_k_means(dataframe_):
    kmeans_training_subset = ['sp', 'wp', 'wnp', 'snp', 'ds', 'dm', 'dl', 'ss', 'sm', 'sl']
    kmeans = KMeans(n_clusters = 3, n_init = 30, max_iter = 1000).fit(ds_cleaned[kmeans_training_subset])
    dataframe_['cluster'] = kmeans.labels_ + 1
    return dataframe_

def test_on_full_dataset(model, full_dataset_path, unlabelled_ids, t, maxlen):
    ds = pd.read_json(full_dataset_path)
    subset = ['id', 'title', 'description', 'connection_id', 'cluster', 'botprob', 'confidence']
    ds_sliced = ds[subset]

    cleaned_df = dataset_cleaning(ds_sliced)

    subset_df = cleaned_df[cleaned_df.id.isin(unlabelled_ids)]

    subset_df['feature_vector'] = subset_df.char_encoding.map(lambda x: pad_sequences(t.texts_to_sequences([x]), maxlen=maxlen)[0])
    #subset_df['feature_vector'] = subset_df.feature_vector.map(lambda x: np.array(to_categorical(x, num_classes=classes), dtype=np.int))

    num_pred = subset_df.shape[0]
    if settings_json['training'] == "char_rnn":
        X_pred = np.concatenate(subset_df['feature_vector'].to_numpy()).reshape([num_pred, maxlen])
    else:
        X_pred = subset_df[training_feature_subset]

    def decode_f(x):
        if x == "Botnet":
            return 1
        else:
            return 0

    subset_df['label'] = subset_df.label.map(lambda x: decode_f(x))

    y_pred = model.predict(X_pred)
    y_pred[y_pred > 0.5] = 1
    y_pred[y_pred < 0.5] = 0

    print(classification_report(subset_df['label'], y_pred))

def generate_difficult_dataset(full_dataset_path, threshold=0.4):
    ds = pd.read_json(full_dataset_path)
    subset = ['id', 'title', 'description', 'connection_id', 'cluster', 'botprob', 'confidence']
    ds_sliced = ds[subset]

    cleaned_df = dataset_cleaning(ds_sliced)

    def decode_f(x):
        if x == "Botnet":
            return 1
        else:
            return 0

    cleaned_df['label'] = cleaned_df.label.map(lambda x: decode_f(x))

    n_splits = 5

    kf = KFold(n_splits=n_splits)

    total_thresholded = pd.DataFrame()

    count = 1

    for train_index, test_index in kf.split(cleaned_df):
        print("\nFold #" + str(count) + " of " + str(n_splits) + " splits.\n")
        count += 1
        Xy_train = cleaned_df.loc[train_index]
        Xy_test = cleaned_df.loc[test_index]
        model, _, _, = train_char_rnn(Xy_train)
        res = apply_model_to_df(Xy_test, model, rnn=True, kfold=True)
        subset = res.loc[(res.botprob < (0.5+threshold)) & (res.botprob > (0.5-threshold))]
        total_thresholded = total_thresholded.append(subset)

    total_thresholded = total_thresholded.drop_duplicates(subset='char_encoding')

    print(total_thresholded)

    exit(0)

def replace_labels(ajax_path, dset_path, save_path):
    import os

    with open(ajax_path, 'r') as f:
        parsed_json = json.load(f)

    # return only rows that correspond to ajax subset
    unlabelled_ids = parsed_json["Unlabelled"]
    botnet_ids =  parsed_json["Botnet"]
    normal_ids =  parsed_json["Normal"]

    if os.path.isfile(save_path):
        df = pd.read_json(save_path)
    else:
        df = pd.read_json(dset_path)

    df.loc[df.id.isin(botnet_ids+normal_ids), 'botprob'] = "NA"

    df.loc[df.id.isin(botnet_ids), 'title'] = "Botnet"
    df.loc[df.id.isin(normal_ids), 'title'] = "Normal"
    df.loc[df.id.isin(unlabelled_ids), 'title'] = "Unlabelled"

    df['confidence'] = df.confidence.map(lambda x: str(x))
    df['cluster'] = df.cluster.map(lambda x: str(x))
    df['id'] = df.id.map(lambda x: str(x))

    df.to_json(save_path, orient="records")

def return_subset_from_ajax(ajax_path, full_dataset_path):
    with open(ajax_path, 'r') as f:
        parsed_json = json.load(f)

    # return only rows that correspond to ajax subset
    unlabelled_ids = parsed_json["Unlabelled"]
    botnet_ids =  parsed_json["Botnet"]
    normal_ids =  parsed_json["Normal"]

    union_all_ids =  botnet_ids + normal_ids + unlabelled_ids

    ds = pd.read_json(full_dataset_path)
    subset = ['id', 'title', 'description', 'connection_id', 'cluster', 'botprob', 'confidence']
    ds_sliced = ds[subset]

    cleaned_df = dataset_cleaning(ds_sliced)

    subset_df = cleaned_df[cleaned_df.id.isin(union_all_ids)]

    # replace labels with labels given from ajax subset

    subset_df.loc[subset_df.id.isin(unlabelled_ids), 'label'] = -1
    subset_df.loc[subset_df.id.isin(botnet_ids), 'label'] = 1
    subset_df.loc[subset_df.id.isin(normal_ids), 'label'] = 0

    return subset_df, unlabelled_ids

def save_to_file(df, file_name, full_dataset_path, ajax_path):

    with open(ajax_path, 'r') as f:
        parsed_json = json.load(f)

    # return only rows that correspond to ajax subset
    unlabelled_ids = parsed_json["Unlabelled"]
    botnet_ids =  parsed_json["Botnet"]
    normal_ids =  parsed_json["Normal"]

    union_all_ids =  botnet_ids + normal_ids + unlabelled_ids

    full_df = pd.read_json(full_dataset_path)

    new_df = full_df[full_df.id.isin(union_all_ids)]

    def process_botprob(x):
        if x == -1:
            return "NA"
        else:
            return str(x)[:5]

    new_df['botprob'] = df.botprob.map(process_botprob)
    new_df['confidence'] = "0.0"
    if settings_json['training'] == "char_rnn":
        new_df['att_vec'] = df['att_vec']

    def title_adjust(x):
        if x == -1:
            return 'Unlabelled'
        elif x == 0:
            return 'Normal'
        elif x == 1:
            return 'Botnet'
        else:
            return None

    new_df['title'] = df.label.map(title_adjust)

    new_df['confidence'] = new_df.confidence.map(lambda x: str(x))
    new_df['cluster'] = new_df.cluster.map(lambda x: str(x))
    new_df['id'] = new_df.id.map(lambda x: str(x))

    new_df.to_json(file_name, orient="records")


def apply_model_to_df(df, model, t, maxlen, att_tensor=None, kfold=False):
    if settings_json['training'] == "char_rnn":
        df['feature_vector'] = df.char_encoding.map(lambda x: pad_sequences(t.texts_to_sequences([x]), maxlen=maxlen)[0])
        #df['feature_vector'] = df.feature_vector.map(lambda x: np.array(to_categorical(x, num_classes=classes), dtype=np.int))

        if not kfold:
            subset = df.loc[df.label == -1, ['feature_vector']]
        else:
            subset = df
        num_pred = subset.shape[0]
        #import pdb; pdb.set_trace()
        X_pred = np.concatenate(subset['feature_vector'].to_numpy()).reshape([num_pred, maxlen])

        res = model.predict(X_pred)

        att_vec = att_tensor.predict(X_pred)

        def process_att_vec(x):
            k_m = KMeans(n_clusters = 9, n_init = 30, max_iter = 1000).fit(x)
            range = [0.0, 0.125, 0.25, 0.375, 0.50, 0.625, 0.75, 0.875, 1.0]

            x = [range[i] for i in k_m.labels_]

            result = str(x).replace('[', '').replace(']', '').replace('\n', '')
            re.sub(' +', ' ', result) #removing extra spaces
            return result

        if not kfold:
            df.loc[df.label == -1, 'botprob'] = res
            df.loc[df.label == -1, 'att_vec'] = [process_att_vec(att_vec[i]) for i in range(0, len(att_vec))]     #repr(att_vec)
            df.loc[df.label != -1, 'botprob'] = -1
        else:
            df['botprob'] = res

        return df
    else:
        res = model.predict(df.loc[df.label == -1, training_feature_subset])
        if settings_json["training"] == "rf":
            df.loc[df.label == -1, 'botprob'] = res.T[1]
        else:
            df.loc[df.label == -1, 'botprob'] = res
        df.loc[df.label != -1, 'botprob'] = -1

        return df
