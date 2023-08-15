# frozen_string_literal: true

module Chemotion
  class VesselAPI < Grape::API
    include Grape::Kaminari
    helpers ParamsHelpers

    rescue_from ActiveRecord::RecordNotFound do
      error!('Resource not found', 401)
    end

    resource :vessels do

      desc 'return list of vessels in a collection'
      params do
        optional :collection_id, type: Integer, desc: 'Collection id'
        optional :sync_collection_id, type: Integer, desc: 'SyncCollectionsUser id'
        optional :filter_created_at, type: Boolean, desc: 'filter by created at or updated at'
        optional :from_date, type: Integer, desc: 'created_date from in ms'
        optional :to_date, type: Integer, desc: 'created_date to in ms'
      end
      paginate per_page: 5, offset: 0
      before do
        params[:per_page].to_i > 50 && (params[:per_page] = 50)
      end
      get do
        scope = if params[:collection_id]
          begin
            Collection.belongs_to_or_shared_by(current_user.id,current_user.group_ids).
            find(params[:collection_id]).vessels
        rescue ActiveRecord::RecordNotFound
          Vessel.none
        end
      elsif params[:sync_collection_id]
        begin
          current_user.all_sync_in_collections_users.find(params[:sync_collection_id]).collection.vessels
          rescue ActiveRecord::RecordNotFound
            Vessel.none
          end
        else
          # All collection of current_user
          Vessel.none.joins(:collections).where('collections.user_id = ?', current_user.id).distinct
        end.order("created_at DESC")

        from = params[:from_date]
        to = params[:to_date]
        by_created_at = params[:filter_created_at] || false

        scope = scope.created_time_from(Time.at(from)) if from && by_created_at
        scope = scope.created_time_to(Time.at(to) + 1.day) if to && by_created_at
        scope = scope.updated_time_from(Time.at(from)) if from && !by_created_at
        scope = scope.updated_time_to(Time.at(to) + 1.day) if to && !by_created_at


        reset_pagination_page(scope)   
        vessels = paginate(scope).map do |vessel|
          Entities::VesselEntity.represent(
            vessel,
            displayed_in_list: true,
          )
        end

        return {
          vessels: vessels,
          vessels_count: scope.count
        }
      end

      desc 'Get a vessel by id'
      params do
        requires :id, type: Integer, desc: 'id of vessel to load'
      end

      get ':id' do
        use_case = Usecases::Vessels::Load.new(params[:id], current_user) 
        begin
          vessel = use_case.execute!
        rescue StandardError => e
          error!(e, 400)
        end
        return present vessel, with: Entities::VesselEntity
      end

      desc 'Create a new vessel'
      params do
        requires :collection_id, type: Integer, desc: "Collection id"
        requires :template_name, type: String, desc: "Name of vessel template"
        optional :details, type: String, desc: 'Other details / specifications of vessel template'
        requires :vessel_type, type: String, desc: 'Vessel type'
        requires :volume_unit, type: String, desc: 'unit of volume'
        requires :volume_amount, type: Integer, desc: 'Volume'
        requires :material_type, type: String, desc: 'Material type'
        optional :material_details, type: String, desc: 'Material details'
        optional :name, type: String, desc: "Name of vessel"
        optional :description, type: String, desc: "Freeform description of vessel"
      end

      post do
        error!('401 unauthorised', 401) unless current_user.collections.find(params[:collection_id])
        use_case = Usecases::Vessels::Create.new(params, current_user)
        begin
          vessel = use_case.execute!
        rescue StandardError => e
          error!(e,400)
        end
        return present vessel, with: Entities::VesselEntity
      end

      desc 'Update an existing vessel'
      params do
        requires :vessel_id, type: Integer, desc: 'id of vessel to update'
        optional :collection_id, type: Integer, desc: 'Collection id'
        requires :template_name, type: String, desc: "Name of vessel template"
        optional :details, type: String, desc: 'Other details / specifications of vessel template'
        requires :vessel_type, type: String, desc: 'Vessel Type'
        requires :volume_unit, type: String, desc: 'unit of volume'
        requires :volume_amount, type: Integer, desc: 'Volume'
        requires :material_type, type: String, desc: 'Material type'
        optional :material_details, type: String, desc: 'Material details'
        optional :name, type: String, desc: "Name of vessel"
        optional :description, type: String, desc: "Freeform description of vessel"
      end

      put do
        use_case = Usecases::Vessels::Update.new(params, current_user)
        begin
          vessel = use_case.execute!
        rescue StandardError => e
          error!(e,400)
        end
        return present vessel, with: Entities::VesselEntity
      end

      desc 'Delete vessel by id'
      params do
        requires :id, type: Integer, desc: "Vessel id"
      end

      delete do
        Vessel.find(@params[:id]).destroy # usecase required?
      end
    end

    resource :vessel_templates do
      desc 'return all vessel templates'
      get 'all' do
        return present VesselTemplate.all, with: Entities::VesselTemplateEntity
      end
    end

  end
end